# Water Bill Management System (Angular + Node/Express + JSON file)

## 1. Backend
    cd backend
    npm install
    npm start          # http://localhost:3000

## 2. Frontend
    npm install -g @angular/cli
    ng new water-bill-frontend --style=css --routing=false --ssr=false
    cd water-bill-frontend
    # Delete: src/app/app.ts / app.component.ts, app.config.ts, app.html, app.css, app.spec.ts, app.routes.ts
    # Copy from frontend-src/:  main.ts -> src/main.ts, styles.css -> src/styles.css,
    #                           app/*   -> src/app/
    ng serve           # http://localhost:4200

## Billing slabs
Fixed charge Rs 50 + (first 100 units @5, next 100 @8, above 200 @12)

## API
GET /api/bills?q=   GET /api/bills/:id   POST /api/bills
PUT /api/bills/:id  PATCH /api/bills/:id/pay   DELETE /api/bills/:id
