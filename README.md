# Burjo Accounting System 🍲

A complete, production-ready web-based accounting system designed specifically for small restaurants (warung burjo). Built with modern technologies and following double-entry bookkeeping principles.

## ✨ Features

### 📊 Financial Management
- **Double-Entry Accounting**: Automatic journal generation from transactions
- **Real-time Balance Tracking**: Always accurate account balances
- **Chart of Accounts**: Pre-configured for restaurant operations
- **FIFO Inventory**: Automatic cost tracking using First-In-First-Out

### 📈 Financial Reports
- **Income Statement**: Revenue, expenses, and net income
- **Balance Sheet**: Assets, liabilities, and equity
- **Cash Flow Statement**: Track cash movements
- **Trial Balance**: Verify accounting accuracy

### 🔐 User Management
- **Role-Based Access Control**: Admin, Accountant, Manager, Viewer
- **JWT Authentication**: Secure token-based auth
- **Audit Trail**: Complete activity logging

### 🏪 Operations
- **Sales Tracking**: Cash and credit sales
- **Expense Recording**: Categorized expense tracking
- **Inventory Management**: Stock tracking with automatic valuation
- **Journal Entries**: Manual and automatic journal creation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/evermore6/accounting.git
cd accounting
```

2. **Start with Docker Compose**
```bash
docker-compose up -d
```

3. **Access the application**
- API: http://localhost:3000
- Health Check: http://localhost:3000/health

That's it! The database will be automatically set up with sample data.

### Option 2: Manual Setup

1. **Clone the repository**
```bash
git clone https://github.com/evermore6/accounting.git
cd accounting
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Create PostgreSQL database**
```bash
createdb burjo_accounting
```

5. **Run migrations**
```bash
bash migrations/run-migrations.sh
```

6. **Start the development server**
```bash
npm run dev
```

7. **Access the application**
- API: http://localhost:3000
- Health Check: http://localhost:3000/health

## 👥 Default Users

After running migrations, you can login with these accounts:

| Email | Password | Role |
|-------|----------|------|
| pakbudi@burjo.local | Password123! | Admin (Owner) |
| siti@burjo.local | Password123! | Accountant |
| rino@burjo.local | Password123! | Manager (Cashier) |
| rina@burjo.local | Password123! | Manager (Cashier) |

## 📚 API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "pakbudi@burjo.local",
  "password": "Password123!"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "pakbudi@burjo.local",
      "firstName": "Pak",
      "lastName": "Budi",
      "role": "admin"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 86400
    }
  }
}
```

### Transactions

#### Record Sales
```http
POST /api/transactions/sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "description": "Daily sales - Nasi Goreng",
  "amount": 50000,
  "paymentMethod": "cash",
  "costOfGoodsSold": 20000
}
```

#### Record Expense
```http
POST /api/transactions/expense
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "description": "Electricity bill",
  "amount": 150000,
  "expenseType": "utilities",
  "paymentMethod": "cash"
}
```

### Reports

#### Get Dashboard Summary
```http
GET /api/reports/dashboard
Authorization: Bearer <token>
```

#### Get Income Statement
```http
GET /api/reports/income-statement?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### Get Balance Sheet
```http
GET /api/reports/balance-sheet?asOf=2024-01-31
Authorization: Bearer <token>
```

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js + Express.js + TypeScript
- PostgreSQL (Database)
- JWT (Authentication)
- Bcrypt (Password Hashing)

**Key Libraries:**
- `pg` - PostgreSQL client
- `jsonwebtoken` - JWT implementation
- `bcryptjs` - Password hashing
- `joi` - Request validation
- `helmet` - Security headers
- `cors` - CORS handling

### Project Structure

```
accounting/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── index.ts         # Main entry point
├── migrations/          # Database migrations
├── Dockerfile
├── docker-compose.yml
└── package.json
```

### Database Schema

**Tables:**
- `users` - User accounts
- `chart_of_accounts` - Account master list
- `transactions` - Transaction headers
- `transaction_details` - Transaction line items
- `journal_entries` - Journal entry headers
- `journal_entry_lines` - Journal entry lines
- `inventory` - Inventory items
- `inventory_transactions` - Stock movements
- `audit_logs` - Activity audit trail

## 📦 Sample Data

The system comes pre-loaded with realistic sample data:

### Chart of Accounts (15 accounts)
- **Assets**: Cash, Bank, Accounts Receivable, Inventory, Equipment, Accumulated Depreciation
- **Liabilities**: Accounts Payable, Wages Payable
- **Equity**: Owner Capital, Retained Earnings
- **Revenue**: Sales Revenue
- **Expenses**: COGS, Raw Materials, Salary, Utilities, Rent, Depreciation

### Sample Transactions (10 entries)
1. Owner capital injection: Rp 5,000,000
2. Equipment purchase: Rp 2,000,000
3. Purchase raw materials (credit): Rp 200,000
4. Cash sales with COGS: Rp 150,000
5. Credit sales (catering): Rp 250,000
6. Salary payment: Rp 500,000
7. Rent payment: Rp 2,000,000
8. Utilities expense: Rp 50,000
9. AR collection: Rp 250,000
10. Daily sales: Rp 300,000

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Role-Based Access**: Granular permission control
- **Audit Logging**: Complete activity trail
- **Input Validation**: Joi schema validation
- **Security Headers**: Helmet.js protection
- **SQL Injection Protection**: Parameterized queries

## 🛠️ Development

### Scripts

```bash
# Development
npm run dev              # Start development server

# Build
npm run build            # Compile TypeScript

# Production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

## 🚢 Deployment

### Docker Deployment

1. Build and start:
```bash
docker-compose up -d
```

2. View logs:
```bash
docker-compose logs -f backend
```

3. Stop services:
```bash
docker-compose down
```

## 📄 License

MIT License

---

**Made with ❤️ for Indonesian Warung Burjo owners**
