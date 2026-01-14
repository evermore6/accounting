# Quick Start Guide - Burjo Accounting System

## 🚀 Get Started in 5 Minutes

### Option 1: Using Docker Compose (Recommended - Easiest!)

```bash
# 1. Clone the repository
git clone https://github.com/evermore6/accounting.git
cd accounting

# 2. Start all services (PostgreSQL, Backend, Frontend)
docker-compose up -d

# 3. Initialize the database
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed

# 4. Open your browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

**That's it! 🎉**

### Login Credentials

Use these demo accounts to login:

| Role | Email | Password |
|------|-------|----------|
| **Owner** | pakbudi@burjo.local | password123 |
| **Admin** | siti@burjo.local | password123 |
| **Staff** | rino@burjo.local | password123 |

---

## 🛠️ Option 2: Manual Setup (For Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Edit .env file with your database credentials
nano .env  # or use your favorite editor

# 5. Run migrations
npm run migrate

# 6. Seed sample data
npm run seed

# 7. Start the server
npm run dev
```

Backend will run on http://localhost:3001

### Frontend Setup (In a new terminal)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Setup environment (optional)
cp .env.example .env

# 4. Start the development server
npm run dev
```

Frontend will run on http://localhost:3000

---

## 📱 What You'll See

### 1. Login Page
- Enter one of the demo credentials
- Click "Sign in"

### 2. Dashboard
- View financial summary
- See recent transactions
- Quick stats on assets, liabilities, and equity

### 3. Main Features

**Transactions**
- Create new sales, purchases, expenses
- View all transactions
- Approve/reject pending transactions (Admin/Owner only)

**Journal Entries**
- View all journal entries
- See automatic double-entry bookkeeping
- Create manual journal entries (Admin/Owner only)

**Reports**
- Income Statement (Profit & Loss)
- Balance Sheet (Financial Position)
- Cash Flow Statement
- Trial Balance

**Inventory**
- View inventory items
- Check stock levels
- See low stock warnings

**User Management** (Admin/Owner only)
- Create new users
- Manage user roles
- Deactivate users

---

## 🎯 Try These Features

### As Owner (pakbudi@burjo.local)
1. View Dashboard → See complete financial overview
2. Go to Reports → Generate Income Statement
3. Check Transactions → Approve pending transactions
4. Visit User Management → View all users

### As Staff (rino@burjo.local)
1. View Dashboard → See limited overview
2. Go to Transactions → Create a new sale
3. Check Inventory → View stock levels

### Create a Transaction
1. Click "Transactions" in sidebar
2. Click "New Transaction" button
3. Fill in the form:
   - Type: Sales (Cash)
   - Date: Today
   - Description: "Sale of food items"
   - Amount: 150000
4. Submit → Automatic journal entries are created!

### Generate a Report
1. Click "Reports" in sidebar
2. Select "Income Statement"
3. Set date range (e.g., 2024-01-01 to 2024-12-31)
4. Click "Generate Report"
5. View revenues, expenses, and net income

---

## 🧪 Sample Data Included

The system comes pre-loaded with:
- ✅ 4 sample users (different roles)
- ✅ 21 chart of accounts
- ✅ 12 sample transactions
- ✅ Automatic journal entries
- ✅ Balanced books ready to use

---

## 📊 Understanding the Accounting

### Every Transaction Creates Journal Entries

**Example: Cash Sale of Rp 150,000**

```
Debit:  Cash (1000)              150,000
Credit: Sales Revenue (4000)               150,000
```

This follows double-entry bookkeeping:
- Cash (Asset) increases → Debit
- Sales Revenue (Revenue) increases → Credit
- Total Debits = Total Credits ✓

### View the Journals
1. Go to "Journal Entries" page
2. See all debits and credits
3. Verify they're balanced

---

## 🔧 Common Commands

### Docker Commands
```bash
# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart a service
docker-compose restart backend

# Access database
docker exec -it burjo-postgres psql -U postgres burjo_accounting
```

### Backend Commands
```bash
# Development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run migrations
npm run migrate

# Seed database
npm run seed
```

### Frontend Commands
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📚 Documentation

- **README.md** - Main documentation
- **API_DOCS.md** - Complete API reference  
- **ACCOUNTING_FLOW.md** - Accounting logic explained
- **DEPLOYMENT_GUIDE.md** - Production deployment
- **SUMMARY.md** - Implementation details

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check if PostgreSQL is running
docker ps

# View backend logs
docker-compose logs backend
```

### Database connection error
```bash
# Ensure PostgreSQL container is running
docker-compose ps postgres

# Check database exists
docker exec -it burjo-postgres psql -U postgres -l
```

### Frontend shows connection error
```bash
# Verify backend is running
curl http://localhost:3001/health

# Check environment variables
cat frontend/.env
```

### Reset everything
```bash
# Stop and remove all containers and data
docker-compose down -v

# Start fresh
docker-compose up -d
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

---

## 🎓 Learning Path

1. **Day 1**: Login and explore the Dashboard
2. **Day 2**: Create transactions and view journals
3. **Day 3**: Generate financial reports
4. **Day 4**: Manage inventory
5. **Day 5**: Understand the approval workflow

---

## 🌟 Next Steps

Once you're comfortable with the basics:
- Read the **ACCOUNTING_FLOW.md** to understand double-entry bookkeeping
- Check **API_DOCS.md** to integrate with other systems
- Review **DEPLOYMENT_GUIDE.md** for production deployment

---

## 💬 Need Help?

- Check the documentation files
- Review the code comments
- Open an issue on GitHub

---

## ✅ Checklist

- [ ] Clone repository
- [ ] Start Docker containers
- [ ] Run migrations and seeds
- [ ] Login with demo account
- [ ] Explore the dashboard
- [ ] Create a transaction
- [ ] View journal entries
- [ ] Generate a financial report
- [ ] Check inventory
- [ ] Read the documentation

**Happy Accounting! 🎉**
