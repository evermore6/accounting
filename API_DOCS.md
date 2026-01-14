# API Documentation

Base URL: `http://localhost:3001/api`

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Authentication Endpoints

### POST /auth/login
Login to the system.

**Request:**
```json
{
  "email": "pakbudi@burjo.local",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "pakbudi",
    "email": "pakbudi@burjo.local",
    "full_name": "Pak Budi",
    "role": "owner"
  }
}
```

### POST /auth/logout
Logout from the system.

### GET /auth/me
Get current user information.

### POST /auth/change-password
Change user password.

**Request:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword123"
}
```

## Transaction Endpoints

### GET /transactions
List all transactions with optional filters.

**Query Parameters:**
- `status` - Filter by status (pending, approved, rejected, posted)
- `type` - Filter by transaction type
- `start_date` - Filter by start date (YYYY-MM-DD)
- `end_date` - Filter by end date (YYYY-MM-DD)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 30)

**Response:**
```json
{
  "transactions": [
    {
      "id": 1,
      "transaction_type": "sales_cash",
      "transaction_date": "2024-01-15",
      "reference_number": "SAL-001",
      "description": "Cash sales - Gado-gado and nasi kuning",
      "total_amount": 150000,
      "status": "posted",
      "created_by_name": "Pak Budi"
    }
  ]
}
```

### POST /transactions
Create a new transaction.

**Request:**
```json
{
  "transaction_type": "sales_cash",
  "transaction_date": "2024-01-15",
  "description": "Cash sales",
  "total_amount": 150000,
  "entries": [
    {
      "account_id": 1,
      "entry_type": "debit",
      "amount": 150000
    },
    {
      "account_id": 14,
      "entry_type": "credit",
      "amount": 150000
    }
  ]
}
```

### GET /transactions/:id
Get transaction details by ID.

### PUT /transactions/:id/approve
Approve a pending transaction (requires Owner or Admin role).

### PUT /transactions/:id/reject
Reject a pending transaction (requires Owner or Admin role).

## Journal Endpoints

### GET /journals
List all journal entries with optional filters.

**Query Parameters:**
- `transaction_id` - Filter by transaction ID
- `account_id` - Filter by account ID
- `start_date` - Filter by start date
- `end_date` - Filter by end date
- `page` - Page number
- `limit` - Results per page

**Response:**
```json
{
  "entries": [
    {
      "id": 1,
      "transaction_id": 1,
      "entry_date": "2024-01-15",
      "account_code": "1000",
      "account_name": "Cash",
      "entry_type": "debit",
      "amount": 150000,
      "reference_number": "SAL-001"
    }
  ]
}
```

### GET /journals/ledger/:accountId
Get general ledger for a specific account.

**Query Parameters:**
- `start_date` - Filter by start date
- `end_date` - Filter by end date

**Response:**
```json
{
  "account": {
    "account_name": "Cash",
    "normal_balance": "debit"
  },
  "entries": [
    {
      "entry_date": "2024-01-15",
      "entry_type": "debit",
      "amount": 150000,
      "description": "Cash sales",
      "balance": 150000
    }
  ],
  "finalBalance": 150000
}
```

### POST /journals/manual
Create a manual journal entry (requires Owner or Admin role).

**Request:**
```json
{
  "entry_date": "2024-01-15",
  "description": "Manual adjustment",
  "entries": [
    {
      "account_id": 1,
      "entry_type": "debit",
      "amount": 100000
    },
    {
      "account_id": 2,
      "entry_type": "credit",
      "amount": 100000
    }
  ]
}
```

## Report Endpoints

### GET /reports/trial-balance
Get trial balance report.

**Query Parameters:**
- `as_of_date` - Report date (YYYY-MM-DD, default: today)

**Response:**
```json
{
  "asOfDate": "2024-01-31",
  "accounts": [
    {
      "account_code": "1000",
      "account_name": "Cash",
      "account_type": "asset",
      "balance": 1000000
    }
  ],
  "totalDebits": 5000000,
  "totalCredits": 5000000,
  "isBalanced": true
}
```

### GET /reports/income-statement
Get income statement.

**Query Parameters (Required):**
- `start_date` - Period start date (YYYY-MM-DD)
- `end_date` - Period end date (YYYY-MM-DD)

**Response:**
```json
{
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "revenues": [
    {
      "account_name": "Sales Revenue",
      "amount": 1000000
    }
  ],
  "expenses": [
    {
      "account_name": "Cost of Goods Sold",
      "amount": 400000
    }
  ],
  "totalRevenue": 1000000,
  "totalExpenses": 600000,
  "netIncome": 400000
}
```

### GET /reports/balance-sheet
Get balance sheet.

**Query Parameters:**
- `as_of_date` - Report date (YYYY-MM-DD, default: today)

### GET /reports/cash-flow
Get cash flow statement.

**Query Parameters (Required):**
- `start_date` - Period start date
- `end_date` - Period end date

## Inventory Endpoints

### GET /inventory
List all inventory items.

**Query Parameters:**
- `low_stock` - Filter low stock items (true/false)

### POST /inventory
Create a new inventory item (requires Owner or Admin role).

**Request:**
```json
{
  "item_code": "RAW-001",
  "item_name": "Rice",
  "unit_of_measure": "kg",
  "minimum_stock": 10
}
```

### POST /inventory/purchase
Record inventory purchase.

**Request:**
```json
{
  "inventory_id": 1,
  "movement_date": "2024-01-15",
  "quantity": 50,
  "unit_cost": 10000,
  "notes": "Purchase from supplier"
}
```

### POST /inventory/usage
Record inventory usage.

**Request:**
```json
{
  "inventory_id": 1,
  "movement_date": "2024-01-15",
  "quantity": 10,
  "unit_cost": 10000,
  "notes": "Used for production"
}
```

### GET /inventory/report
Get inventory report.

## User Endpoints

### GET /users
List all users (requires Owner or Admin role).

### POST /users
Create a new user (requires Owner or Admin role).

**Request:**
```json
{
  "username": "newuser",
  "email": "newuser@burjo.local",
  "password": "password123",
  "full_name": "New User",
  "role": "staff"
}
```

### PUT /users/:id
Update user information (requires Owner or Admin role).

### DELETE /users/:id
Deactivate user (requires Owner or Admin role).

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [...]
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```
