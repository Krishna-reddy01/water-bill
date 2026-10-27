# Water Bill Management System

A full-stack web application to generate and manage water bills.
Built for the **Essentials of Web Programming** PBL project.

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Angular (standalone components)     |
| Backend  | Node.js + Express (REST API)        |
| Storage  | JSON file (`backend/data/bills.json`) |

## Features

- Generate a water bill from the previous and current meter readings (in kilolitres)
- Domestic and Commercial connection types with separate tariffs
- Automatic calculation of water charge, sewerage charge, service charge and total
- Billing month and due date (15 days after the bill is generated)
- Mark a bill as Paid, edit it, or delete it
- Search by customer name or meter number
- Total number of bills and total pending amount
- Server-side validation (required fields, readings must be valid, current reading cannot be less than previous)

## Tariff

Usage is measured in kilolitres (KL). 1 KL = 1000 litres.

**Domestic**

| Usage            | Rate per KL |
|------------------|-------------|
| First 10 KL      | Rs 7        |
| Next 10 KL (11-20) | Rs 11     |
| Above 20 KL      | Rs 15       |

Service charge: Rs 30

**Commercial**

| Usage            | Rate per KL |
|------------------|-------------|
| First 10 KL      | Rs 25       |
| Above 10 KL      | Rs 35       |

Service charge: Rs 100

**Sewerage charge** = 20% of the water charge
**Total** = water charge + sewerage charge + service charge

Example (Domestic, readings 100 to 125 = 25 KL):
water = 10x7 + 10x11 + 5x15 = 255, sewerage = 51, service = 30, **total = Rs 336**

## Project structure

```
water-bill/
├── backend/
│   ├── server.js          Express API and billing logic
│   ├── package.json
│   └── data/bills.json    JSON file storage
└── water-bill-frontend/
    └── src/
        ├── main.ts
        ├── styles.css
        └── app/
            ├── bill.model.ts
            ├── bill.service.ts          HTTP calls to the API
            ├── bill-form.component.ts   Add / edit form
            ├── bill-list.component.ts   Bills table
            └── app.component.ts         Root component, search, totals
```

## How to run

Prerequisites: Node.js (LTS) and the Angular CLI (`npm install -g @angular/cli`).

**1. Backend** (terminal 1)

```
cd backend
npm install
npm start
```

The API runs at `http://localhost:3000`.

**2. Frontend** (terminal 2)

```
cd water-bill-frontend
npm install
ng serve
```

Open `http://localhost:4200` in the browser. Keep both terminals running.

> On Windows PowerShell, if you see "running scripts is disabled", use `npm.cmd start` and `ng.cmd serve`, or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once.

Note: opening `http://localhost:3000` directly shows "Cannot GET /". This is normal, because the backend only has API routes. Try `http://localhost:3000/api/bills`.

## API

Base URL: `http://localhost:3000/api`

| Method | Route               | Description                              |
|--------|---------------------|------------------------------------------|
| GET    | `/bills`            | List all bills (optional `?q=` search)   |
| GET    | `/bills/:id`        | Get one bill                             |
| POST   | `/bills`            | Create a bill                            |
| PUT    | `/bills/:id`        | Update a bill (charges are recalculated) |
| PATCH  | `/bills/:id/pay`    | Mark a bill as Paid                      |
| DELETE | `/bills/:id`        | Delete a bill                            |

Example request body for `POST /api/bills`:

```json
{
  "customerName": "Krishna",
  "meterNo": "112",
  "connectionType": "Domestic",
  "billingMonth": "2026-10",
  "previousReading": 100,
  "currentReading": 125
}
```

Example response:

```json
{
  "id": 1,
  "customerName": "Krishna",
  "meterNo": "112",
  "connectionType": "Domestic",
  "billingMonth": "2026-10",
  "previousReading": 100,
  "currentReading": 125,
  "usageKL": 25,
  "waterCharge": 255,
  "sewerageCharge": 51,
  "serviceCharge": 30,
  "amount": 336,
  "billDate": "2026-10-27",
  "dueDate": "2026-11-11",
  "status": "Unpaid"
}
```
