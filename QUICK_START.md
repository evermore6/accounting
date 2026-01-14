# Quick Start Guide - Burjo Accounting System

## 🚀 Get Started in 3 Minutes

### Prerequisites
- Docker and Docker Compose installed
- OR Node.js 18+ and PostgreSQL 15+

## Option 1: Docker (Easiest - Recommended)

### Step 1: Clone the repository
```bash
git clone https://github.com/evermore6/accounting.git
cd accounting
```

### Step 2: Start the application
```bash
docker-compose up -d
```

### Step 3: Wait for services to start (30-60 seconds)
```bash
docker-compose logs -f backend
```

Wait until you see:
```
Burjo Accounting System - API Server Running
```

### Step 4: Test the API
```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...
}
```

### Step 5: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pakbudi@burjo.local",
    "password": "Password123!"
  }'
```

You'll get a response with an access token:
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

### Step 6: View Dashboard Summary
```bash
TOKEN="<paste your accessToken here>"

curl -X GET http://localhost:3000/api/reports/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

You'll see real financial data from the sample transactions!

---

## Option 2: Manual Setup (For Development)

### Step 1: Clone and install
```bash
git clone https://github.com/evermore6/accounting.git
cd accounting
npm install
```

### Step 2: Setup environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### Step 3: Create database
```bash
createdb burjo_accounting
```

### Step 4: Run migrations
```bash
bash migrations/run-migrations.sh
```

### Step 5: Start development server
```bash
npm run dev
```

Server starts at http://localhost:3000

---

## 🧪 Testing the API

### 1. Check Health
```bash
curl http://localhost:3000/health
```

### 2. Login as Owner
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pakbudi@burjo.local",
    "password": "Password123!"
  }'
```

Save the `accessToken` from the response.

### 3. Get Balance Sheet
```bash
curl -X GET http://localhost:3000/api/reports/balance-sheet \
  -H "Authorization: Bearer <your-token>"
```

### 4. Get Income Statement
```bash
curl -X GET "http://localhost:3000/api/reports/income-statement?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer <your-token>"
```

### 5. Record a Sale
```bash
curl -X POST http://localhost:3000/api/transactions/sales \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "description": "Daily sales - Nasi Goreng",
    "amount": 50000,
    "paymentMethod": "cash",
    "costOfGoodsSold": 20000
  }'
```

### 6. Record an Expense
```bash
curl -X POST http://localhost:3000/api/transactions/expense \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "description": "Electricity bill",
    "amount": 150000,
    "expenseType": "utilities",
    "paymentMethod": "cash"
  }'
```

### 7. List Journal Entries
```bash
curl -X GET http://localhost:3000/api/journals \
  -H "Authorization: Bearer <your-token>"
```

### 8. Get Trial Balance
```bash
curl -X GET http://localhost:3000/api/reports/trial-balance \
  -H "Authorization: Bearer <your-token>"
```

---

## 👥 Default Users

| Email | Password | Role | Access |
|-------|----------|------|--------|
| pakbudi@burjo.local | Password123! | Admin | Full access |
| siti@burjo.local | Password123! | Accountant | Financial operations |
| rino@burjo.local | Password123! | Manager | Daily operations |
| rina@burjo.local | Password123! | Manager | Daily operations |

---

## 📊 Sample Data Included

The system comes pre-loaded with:

### Financial Summary
- **Total Revenue**: Rp 700,000
- **Total Expenses**: Rp 2,780,000
- **Net Loss**: (Rp 2,080,000) - Expected in first month
- **Cash Balance**: Positive (after owner capital)
- **Accounts Receivable**: Rp 0 (all collected)
- **Inventory**: Some remaining stock

### 10 Sample Transactions
1. Owner capital injection
2. Equipment purchase
3. Raw materials purchase
4. Cash sales (with COGS)
5. Credit sales (catering)
6. Salary payment
7. Rent payment
8. Utilities expense
9. AR collection
10. Daily sales

---

## 🎯 What You Can Do

### Record Transactions
- ✅ Sales (cash or credit)
- ✅ Purchases (inventory)
- ✅ Expenses (utilities, salary, rent, etc.)
- ✅ Owner capital/withdrawals
- ✅ AR collections
- ✅ AP payments

### View Reports
- ✅ Income Statement (P&L)
- ✅ Balance Sheet
- ✅ Cash Flow Statement
- ✅ Trial Balance
- ✅ Dashboard Summary

### Manage Inventory
- ✅ Add inventory items
- ✅ Receive stock
- ✅ Issue stock
- ✅ View stock value
- ✅ Low stock alerts

### User Management
- ✅ Create users
- ✅ Assign roles
- ✅ Update permissions
- ✅ View activity logs

---

## 🛑 Troubleshooting

### Docker containers not starting
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose down
docker-compose up -d
```

### Database connection error
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check database logs
docker-compose logs postgres
```

### Port 3000 already in use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or change port in .env and docker-compose.yml
```

### Cannot login
- Make sure migrations have run
- Check database has sample data:
  ```bash
  docker-compose exec postgres psql -U postgres -d burjo_accounting -c "SELECT * FROM users;"
  ```

---

## 📚 Next Steps

1. **Explore the API**
   - Try all endpoints
   - Record your own transactions
   - View updated reports

2. **Customize**
   - Add more accounts
   - Create custom transactions
   - Add more users

3. **Integrate**
   - Build a frontend
   - Connect to mobile app
   - Export reports

4. **Production**
   - Change JWT secret
   - Update passwords
   - Configure SSL/TLS
   - Set up monitoring

---

## 🆘 Need Help?

- **Documentation**: See README.md
- **API Details**: See IMPLEMENTATION_SUMMARY.md
- **Issues**: GitHub Issues
- **Email**: support@burjoaccounting.com

---

## 🎉 You're Ready!

The Burjo Accounting System is now running with:
- ✅ Complete backend API
- ✅ PostgreSQL database
- ✅ Sample data loaded
- ✅ All features working

Start recording transactions and managing your burjo finances! 🍲
