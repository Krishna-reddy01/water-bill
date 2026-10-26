const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const FILE = path.join(__dirname, 'data', 'bills.json');
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ---------- JSON file helpers ----------
const readBills = () => {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return []; }
};
const writeBills = (data) => fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

// ---------- Billing logic (slab rates) ----------
const FIXED_CHARGE = 50;
function calculate(prev, curr) {
  const units = curr - prev;
  let amount = FIXED_CHARGE;
  if (units <= 100) amount += units * 5;
  else if (units <= 200) amount += 100 * 5 + (units - 100) * 8;
  else amount += 100 * 5 + 100 * 8 + (units - 200) * 12;
  return { units, amount };
}

function validate(b) {
  if (!b.customerName || !String(b.customerName).trim()) return 'Customer name is required';
  if (!b.meterNo || !String(b.meterNo).trim()) return 'Meter number is required';
  const prev = Number(b.previousReading), curr = Number(b.currentReading);
  if (isNaN(prev) || isNaN(curr) || prev < 0 || curr < 0) return 'Readings must be valid positive numbers';
  if (curr < prev) return 'Current reading cannot be less than previous reading';
  return null;
}

// ---------- Routes ----------
// Get all bills (optional ?q= search by name or meter number)
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
  const bill = {
    id: bills.length ? Math.max(...bills.map(b => b.id)) + 1 : 1,
    customerName: req.body.customerName.trim(),
    meterNo: req.body.meterNo.trim(),
    previousReading: prev,
    currentReading: curr,
    ...calculate(prev, curr),
    billDate: new Date().toISOString().slice(0, 10),
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
    previousReading: prev,
    currentReading: curr,
    ...calculate(prev, curr)
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
