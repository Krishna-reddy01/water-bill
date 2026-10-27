const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const FILE = path.join(__dirname, 'data', 'bills.json');
const PORT = 3000;

app.use(cors());
app.use(express.json());

const readBills = () => {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return []; }
};
const writeBills = (data) => fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
const round2 = (n) => Math.round(n * 100) / 100;

// ---------- Water tariff (usage measured in kilolitres, 1 KL = 1000 litres) ----------
const TARIFF = {
  Domestic:   { service: 30,  slabs: [{ upto: 10, rate: 7 }, { upto: 20, rate: 11 }, { upto: Infinity, rate: 15 }] },
  Commercial: { service: 100, slabs: [{ upto: 10, rate: 25 }, { upto: Infinity, rate: 35 }] }
};
const SEWERAGE_PERCENT = 0.20; // 20% of water charge

function calculate(prev, curr, type) {
  const usageKL = round2(curr - prev);
  const t = TARIFF[type];
  let remaining = usageKL, lower = 0, water = 0;
  for (const s of t.slabs) {
    const inSlab = Math.min(remaining, s.upto - lower);
    if (inSlab <= 0) break;
    water += inSlab * s.rate;
    remaining -= inSlab;
    lower = s.upto;
  }
  const waterCharge = round2(water);
  const sewerageCharge = round2(waterCharge * SEWERAGE_PERCENT);
  const serviceCharge = t.service;
  return {
    usageKL, waterCharge, sewerageCharge, serviceCharge,
    amount: round2(waterCharge + sewerageCharge + serviceCharge)
  };
}

function validate(b) {
  if (!b.customerName || !String(b.customerName).trim()) return 'Customer name is required';
  if (!b.meterNo || !String(b.meterNo).trim()) return 'Meter number is required';
  if (!TARIFF[b.connectionType]) return 'Connection type must be Domestic or Commercial';
  if (!b.billingMonth) return 'Billing month is required';
  const prev = Number(b.previousReading), curr = Number(b.currentReading);
  if (isNaN(prev) || isNaN(curr) || prev < 0 || curr < 0) return 'Readings must be valid positive numbers';
  if (curr < prev) return 'Current reading cannot be less than previous reading';
  return null;
}

const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };

// ---------- Routes ----------
app.get('/api/bills', (req, res) => {
  let bills = readBills();
  const q = (req.query.q || '').toString().toLowerCase();
  if (q) bills = bills.filter(b =>
    b.customerName.toLowerCase().includes(q) || b.meterNo.toLowerCase().includes(q));
  res.json(bills);
});

app.get('/api/bills/:id', (req, res) => {
  const bill = readBills().find(b => b.id === Number(req.params.id));
  if (!bill) return res.status(404).json({ message: 'Bill not found' });
  res.json(bill);
});

app.post('/api/bills', (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });
  const bills = readBills();
  const prev = Number(req.body.previousReading), curr = Number(req.body.currentReading);
  const today = new Date().toISOString().slice(0, 10);
  const bill = {
    id: bills.length ? Math.max(...bills.map(b => b.id)) + 1 : 1,
    customerName: req.body.customerName.trim(),
    meterNo: req.body.meterNo.trim(),
    connectionType: req.body.connectionType,
    billingMonth: req.body.billingMonth,
    previousReading: prev,
    currentReading: curr,
    ...calculate(prev, curr, req.body.connectionType),
    billDate: today,
    dueDate: addDays(today, 15),
    status: 'Unpaid'
  };
  bills.push(bill);
  writeBills(bills);
  res.status(201).json(bill);
});

app.put('/api/bills/:id', (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });
  const bills = readBills();
  const i = bills.findIndex(b => b.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ message: 'Bill not found' });
  const prev = Number(req.body.previousReading), curr = Number(req.body.currentReading);
  bills[i] = {
    ...bills[i],
    customerName: req.body.customerName.trim(),
    meterNo: req.body.meterNo.trim(),
    connectionType: req.body.connectionType,
    billingMonth: req.body.billingMonth,
    previousReading: prev,
    currentReading: curr,
    ...calculate(prev, curr, req.body.connectionType)
  };
  writeBills(bills);
  res.json(bills[i]);
});

app.patch('/api/bills/:id/pay', (req, res) => {
  const bills = readBills();
  const bill = bills.find(b => b.id === Number(req.params.id));
  if (!bill) return res.status(404).json({ message: 'Bill not found' });
  bill.status = 'Paid';
  writeBills(bills);
  res.json(bill);
});

app.delete('/api/bills/:id', (req, res) => {
  const bills = readBills();
  const remaining = bills.filter(b => b.id !== Number(req.params.id));
  if (remaining.length === bills.length) return res.status(404).json({ message: 'Bill not found' });
  writeBills(remaining);
  res.json({ message: 'Bill deleted' });
});

app.listen(PORT, () => console.log(`Water bill API running at http://localhost:${PORT}`));
