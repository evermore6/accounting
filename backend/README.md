# Burjo Accounting System - Backend

Backend API for the Burjo Accounting System built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- **Double-Entry Bookkeeping**: Automatic journal entry generation
- **Multi-Role Access Control**: Owner, Admin, Staff, and Viewer roles
- **Approval Workflow**: 2-tier approval for transactions ≥ Rp 500K
- **Financial Reports**: Income Statement, Balance Sheet, Cash Flow, Trial Balance
- **Inventory Management**: FIFO method with stock tracking
- **Audit Logging**: Complete user activity tracking
- **RESTful API**: Well-structured endpoints with JWT authentication

## Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=burjo_accounting
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
APPROVAL_THRESHOLD=500000
CURRENCY=IDR
CORS_ORIGIN=http://localhost:3000
```

4. Run database migrations:
```bash
npm run migrate
```

5. Seed the database with sample data:
```bash
npm run seed
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Running Tests
```bash
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction details
- `PUT /api/transactions/:id/approve` - Approve transaction
- `PUT /api/transactions/:id/reject` - Reject transaction

### Journals
- `GET /api/journals` - List journal entries
- `GET /api/journals/ledger/:accountId` - General ledger by account
- `POST /api/journals/manual` - Create manual journal entry

### Reports
- `GET /api/reports/trial-balance` - Trial Balance
- `GET /api/reports/income-statement` - Income Statement
- `GET /api/reports/balance-sheet` - Balance Sheet
- `GET /api/reports/cash-flow` - Cash Flow Statement

### Users (Owner/Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### Inventory
- `GET /api/inventory` - List inventory items
- `GET /api/inventory/report` - Inventory report
- `POST /api/inventory` - Create inventory item
- `POST /api/inventory/purchase` - Record purchase
- `POST /api/inventory/usage` - Record usage

## Sample Users

After seeding, you can login with these credentials:

| Role | Email | Password | Username |
|------|-------|----------|----------|
| Owner | pakbudi@burjo.local | password123 | pakbudi |
| Admin | siti@burjo.local | password123 | siti |
| Staff | rino@burjo.local | password123 | rino |
| Staff | rina@burjo.local | password123 | rina |

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── migrations/          # Database migrations
├── seeds/              # Database seed data
└── tests/              # Test files
```

## License

MIT
