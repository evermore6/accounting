# Accounting Flow Documentation

This document explains the double-entry bookkeeping logic and automatic journal entry generation in the Burjo Accounting System.

## Double-Entry Bookkeeping Principles

Every financial transaction affects at least two accounts:
- **Debit**: Increases assets and expenses, decreases liabilities, equity, and revenue
- **Credit**: Increases liabilities, equity, and revenue, decreases assets and expenses

**Golden Rule**: Total Debits MUST equal Total Credits

## Account Normal Balances

| Account Type | Normal Balance | Increases By | Decreases By |
|--------------|----------------|--------------|--------------|
| Assets | Debit | Debit | Credit |
| Liabilities | Credit | Credit | Debit |
| Equity | Credit | Credit | Debit |
| Revenue | Credit | Credit | Debit |
| Expenses | Debit | Debit | Credit |

## Transaction Types and Auto-Journal Rules

### 1. Cash Sales (sales_cash)

**Example**: Rp 150,000 cash sale

```
Debit:  Cash (1000)              150,000
Credit: Sales Revenue (4000)               150,000
```

**Explanation**: Cash (asset) increases, Sales Revenue (revenue) increases.

### 2. Credit Sales (sales_credit)

**Example**: Rp 250,000 credit sale

```
Debit:  Accounts Receivable (1300)  250,000
Credit: Sales Revenue (4000)                  250,000
```

**Explanation**: Accounts Receivable (asset) increases, Sales Revenue (revenue) increases.

### 3. Cash Purchase of Inventory (purchase_cash)

**Example**: Rp 200,000 cash purchase

```
Debit:  Inventory (1200)         200,000
Credit: Cash (1000)                        200,000
```

**Explanation**: Inventory (asset) increases, Cash (asset) decreases.

### 4. Credit Purchase of Inventory (purchase_credit)

**Example**: Rp 300,000 credit purchase

```
Debit:  Inventory (1200)         300,000
Credit: Accounts Payable (2000)            300,000
```

**Explanation**: Inventory (asset) increases, Accounts Payable (liability) increases.

### 5. Inventory Usage / Cost of Goods Sold (inventory_usage)

**Example**: Rp 180,000 raw materials used

```
Debit:  Cost of Goods Sold (5000)  180,000
Credit: Inventory (1200)                     180,000
```

**Explanation**: COGS (expense) increases, Inventory (asset) decreases.

### 6. Operating Expenses (operating_expense)

**Example**: Rp 50,000 utilities payment

```
Debit:  Utilities Expense (5300)    50,000
Credit: Cash (1000)                          50,000
```

**Explanation**: Utilities Expense (expense) increases, Cash (asset) decreases.

### 7. Salary Payment (salary_payment)

**Example**: Rp 500,000 salary payment

```
Debit:  Salary Expense (5200)      500,000
Credit: Cash (1000)                         500,000
```

**Explanation**: Salary Expense (expense) increases, Cash (asset) decreases.

### 8. Owner Capital Injection (owner_capital)

**Example**: Rp 1,000,000 capital injection

```
Debit:  Cash (1000)              1,000,000
Credit: Owner Capital (3000)               1,000,000
```

**Explanation**: Cash (asset) increases, Owner Capital (equity) increases.

### 9. Owner Withdrawal (owner_withdrawal)

**Example**: Rp 200,000 owner withdrawal

```
Debit:  Owner Drawings (3100)      200,000
Credit: Cash (1000)                         200,000
```

**Explanation**: Owner Drawings (contra-equity) increases, Cash (asset) decreases.

### 10. Monthly Depreciation (depreciation)

**Example**: Rp 100,000 monthly depreciation

```
Debit:  Depreciation Expense (5500)  100,000
Credit: Accumulated Depreciation (1510)       100,000
```

**Explanation**: Depreciation Expense (expense) increases, Accumulated Depreciation (contra-asset) increases.

## Inventory FIFO Calculation

The system uses the **First-In-First-Out (FIFO)** method for inventory valuation.

### Example:

**Purchases:**
1. Jan 5: 10 kg @ Rp 10,000 = Rp 100,000
2. Jan 10: 15 kg @ Rp 12,000 = Rp 180,000

**Usage on Jan 15: 20 kg**

**FIFO Calculation:**
- Use 10 kg from first purchase @ Rp 10,000 = Rp 100,000
- Use 10 kg from second purchase @ Rp 12,000 = Rp 120,000
- **Total COGS: Rp 220,000**

**Remaining Inventory:**
- 5 kg @ Rp 12,000 = Rp 60,000

## Financial Statement Generation

### Income Statement
```
Revenue:
  Sales Revenue                    1,000,000

Expenses:
  Cost of Goods Sold                (400,000)
  Salary Expense                    (100,000)
  Utilities Expense                  (50,000)
  Rent Expense                      (200,000)
  Depreciation Expense               (50,000)
  
Total Expenses                      (800,000)

Net Income                           200,000
```

### Balance Sheet
```
Assets:
  Cash                               500,000
  Inventory                          300,000
  Accounts Receivable                200,000
  Equipment                        1,000,000
  Less: Accumulated Depreciation    (100,000)
  
Total Assets                       1,900,000

Liabilities:
  Accounts Payable                   300,000
  Wages Payable                       50,000
  
Total Liabilities                    350,000

Equity:
  Owner Capital                    1,000,000
  Retained Earnings                  550,000
  
Total Equity                       1,550,000

Total Liabilities + Equity         1,900,000
```

## Approval Workflow

Transactions with amount ≥ Rp 500,000 require approval:

1. **Staff creates transaction** → Status: `pending`
2. **Admin/Owner approves** → Status: `approved` or `posted`
3. **If rejected** → Status: `rejected`

### Approval Rules:
- **< Rp 500,000**: Auto-posted
- **≥ Rp 500,000**: Requires Admin or Owner approval
- **Owner transactions**: Always posted (self-approval)

## Validation Rules

1. **Journal Entry Balance**: Total Debits MUST equal Total Credits
2. **Transaction Amount**: Must be positive
3. **Account Existence**: All accounts must exist in Chart of Accounts
4. **Date Validity**: Transaction date cannot be in future
5. **Inventory Availability**: Cannot use more inventory than available
6. **User Authorization**: User must have permission for the action

## Common Scenarios

### Daily Sales Recording
1. Record cash sales → Auto-journal: Dr. Cash, Cr. Sales Revenue
2. Record COGS → Auto-journal: Dr. COGS, Cr. Inventory (FIFO)

### Month-End Closing
1. Record all expenses (rent, utilities, salaries)
2. Record depreciation
3. Generate financial statements
4. Close revenue and expense accounts to Retained Earnings

### Purchase and Payment
1. Record credit purchase → Dr. Inventory, Cr. Accounts Payable
2. When paid → Dr. Accounts Payable, Cr. Cash

This ensures all transactions are properly recorded using double-entry bookkeeping principles.
