# Daily Loan Ledger System

A full-stack web application designed to mimic a traditional physical daily installment notebook. It allows users to manage loans, track daily payments, and view detailed ledgers.

## Features
- **Loan Management**: Create and track loans (Active/Closed).
- **Daily Installments**: Record daily payments with auto-calculation of balance and receipt numbers.
- **Ledger View**: Detailed table of all payments with total paid and remaining balance.
- **Rich UI**: Premium "Ledger Book" aesthetic using Tailwind CSS and Playfair Display font.
- **Auto-Closing**: Loans are automatically marked as "Closed" when the balance reaches zero.
- **Printable Ledger**: One-click printing of loan ledgers.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MySQL (via Sequelize ORM)
- **Frontend**: React.js (Vite), Tailwind CSS
- **API**: Axios
- **Icons**: Lucide-React
- **Toasts**: React-Hot-Toast

---

## Setup Instructions

### 1. Database Configuration
1. Open your MySQL client (e.g., phpMyAdmin, MySQL Workbench).
2. Create a new database named `loan_ledger_db`.
3. Check `backend/.env` and update the `DB_USER` and `DB_PASSWORD` if necessary.

### 2. Backend Setup
```bash
cd backend
npm install
# Ensure MySQL is running
node server.js
```
The server will automatically sync and create the necessary tables on first run.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open the provided local URL (usually `http://localhost:5173`) in your browser.

---

## Sample Data (Usage Flow)
1. **Create Loan**: Go to "New Loan", fill in details (e.g., Rahul, Amount: 10,000) and save.
2. **Add Payment**: Open the loan from the dashboard. In the "Quick Installment" box, enter an amount (e.g., 500) and click "Add Payment".
3. **Observe Ledger**: The table will update with a new receipt number and the balance will decrease automatically.
4. **Close Loan**: Pay off the full balance to see the status change to "Closed".

## API Endpoints
- `GET /api/loans`: List all loans.
- `POST /api/loans`: Create a new loan.
- `GET /api/installments/:loanId`: Get full ledger for a loan.
- `POST /api/installments`: Add a new payment.
- `POST /api/auth/login`: Admin login (Default: admin / admin123).

---

## Folder Structure
- `backend/`: Express server, Sequelize models, controllers, and routes.
- `frontend/`: React components, pages, and Tailwind styling.
- `backend/config/db.js`: Database connection & initialization.
- `backend/models/`: Sequelize schemas for Loan and Installment.
