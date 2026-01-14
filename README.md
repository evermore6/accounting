# Burjo Accounting System

A comprehensive web-based double-entry accounting system designed specifically for small food stalls (Burjo/Warung Makan) with multi-role access control and complete financial reporting.

## 🎯 Overview

This system provides:
- **Double-Entry Bookkeeping**: Automatic journal entry generation
- **Multi-Role Access Control**: Owner, Admin Accounting, Staff, and Viewer roles
- **Approval Workflow**: 2-tier approval for high-value transactions (≥ Rp 500K)
- **Financial Reports**: Income Statement, Balance Sheet, Cash Flow, Trial Balance
- **Inventory Management**: FIFO method with real-time stock tracking
- **Audit Logging**: Complete activity tracking for compliance

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/evermore6/accounting.git
cd accounting
```

2. Start all services:
```bash
docker-compose up -d
```

3. Initialize the database:
```bash
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

### Manual Setup

#### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run seed
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed
npm run dev
```

## 📋 Default Login Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| Owner | pakbudi@burjo.local | password123 | Full system access |
| Admin | siti@burjo.local | password123 | Transaction & report management |
| Staff | rino@burjo.local | password123 | Create sales & purchases |
| Staff | rina@burjo.local | password123 | Create sales & purchases |

**⚠️ Change these passwords in production!**

## 📊 Chart of Accounts

### Assets
- Cash (1000)
- Bank (1100)
- Inventory (1200)
- Accounts Receivable (1300)
- Prepaid Expense (1400)
- Equipment (1500)
- Accumulated Depreciation (1510)

### Liabilities
- Accounts Payable (2000)
- Wages Payable (2100)
- Utilities Payable (2200)

### Equity
- Owner Capital (3000)
- Owner Drawings (3100)
- Retained Earnings (3200)

### Revenue
- Sales Revenue (4000)

### Expenses
- Cost of Goods Sold (5000)
- Raw Material Expense (5100)
- Salary Expense (5200)
- Utilities Expense (5300)
- Rent Expense (5400)
- Depreciation Expense (5500)
- Other Operating Expense (5600)

## 🔌 API Documentation

See [API_DOCS.md](./API_DOCS.md) for detailed API documentation.

## 📖 Accounting Flow

See [ACCOUNTING_FLOW.md](./ACCOUNTING_FLOW.md) for detailed accounting logic and journal entry examples.

## 🚢 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment instructions.

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL with ACID compliance
- JWT authentication
- bcrypt for password hashing

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS
- React Router
- Axios for API calls
- Recharts for visualizations

**DevOps:**
- Docker & Docker Compose
- Nginx (for production)

### Project Structure

```
accounting/
├── backend/           # Node.js backend
│   ├── src/
│   ├── migrations/
│   └── seeds/
├── frontend/          # React frontend
│   ├── src/
│   └── public/
├── docker-compose.yml
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- SQL injection prevention
- Audit logging for all sensitive actions
- Input validation and sanitization
- Regular dependency security audits
- No vulnerable dependencies (see SECURITY.md)

**Note**: PDF and Excel export features are not included in this version to avoid vulnerable dependencies. Reports can be viewed on-screen and printed using the browser's print function. For export needs, see SECURITY.md for recommended server-side implementation approaches.

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.
