-- Migration 007: Insert sample data for Burjo Accounting System

-- ============================================================================
-- PART 1: INSERT SAMPLE USERS
-- ============================================================================

-- Password for all users: Password123! (hashed with bcrypt, cost 10)
-- Hash: $2a$10$8Z9QX5J5ZQ5Z9QX5J5ZQ5O9xYvJ5Z9QX5J5ZQ5Z9QX5J5ZQ5Z9QX5

INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, status) VALUES
('11111111-1111-1111-1111-111111111111', 'pakbudi@burjo.local', '$2a$10$YQ5J5ZQ5Z9QX5J5ZQ5Z9Qu9xYvJ5Z9QX5J5ZQ5Z9QX5J5ZQ5Z9QXu', 'Pak', 'Budi', '081234567890', 'admin', 'active'),
('22222222-2222-2222-2222-222222222222', 'siti@burjo.local', '$2a$10$YQ5J5ZQ5Z9QX5J5ZQ5Z9Qu9xYvJ5Z9QX5J5ZQ5Z9QX5J5ZQ5Z9QXu', 'Ibu', 'Siti', '081234567891', 'accountant', 'active'),
('33333333-3333-3333-3333-333333333333', 'rino@burjo.local', '$2a$10$YQ5J5ZQ5Z9QX5J5ZQ5Z9Qu9xYvJ5Z9QX5J5ZQ5Z9QX5J5ZQ5Z9QXu', 'Rino', 'Cahyadi', '081234567892', 'manager', 'active'),
('44444444-4444-4444-4444-444444444444', 'rina@burjo.local', '$2a$10$YQ5J5ZQ5Z9QX5J5ZQ5Z9Qu9xYvJ5Z9QX5J5ZQ5Z9QX5J5ZQ5Z9QXu', 'Rina', 'Sari', '081234567893', 'manager', 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PART 2: INSERT CHART OF ACCOUNTS
-- ============================================================================

-- ASSETS (1xxx)
INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, status, balance, currency) VALUES
('a0000001-0000-0000-0000-000000000001', '1001', 'Cash', 'asset', 'active', 0, 'IDR'),
('a0000001-0000-0000-0000-000000000002', '1002', 'Bank', 'asset', 'active', 0, 'IDR'),
('a0000001-0000-0000-0000-000000000003', '1003', 'Accounts Receivable', 'asset', 'active', 0, 'IDR'),
('a0000001-0000-0000-0000-000000000004', '1004', 'Inventory', 'asset', 'active', 0, 'IDR'),
('a0000001-0000-0000-0000-000000000005', '1005', 'Equipment', 'asset', 'active', 0, 'IDR'),
('a0000001-0000-0000-0000-000000000006', '1006', 'Accumulated Depreciation', 'asset', 'active', 0, 'IDR')
ON CONFLICT (account_code) DO NOTHING;

-- LIABILITIES (2xxx)
INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, status, balance, currency) VALUES
('a0000002-0000-0000-0000-000000000001', '2001', 'Accounts Payable', 'liability', 'active', 0, 'IDR'),
('a0000002-0000-0000-0000-000000000002', '2002', 'Wages Payable', 'liability', 'active', 0, 'IDR')
ON CONFLICT (account_code) DO NOTHING;

-- EQUITY (3xxx)
INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, status, balance, currency) VALUES
('a0000003-0000-0000-0000-000000000001', '3001', 'Owner Capital', 'equity', 'active', 0, 'IDR'),
('a0000003-0000-0000-0000-000000000002', '3002', 'Retained Earnings', 'equity', 'active', 0, 'IDR')
ON CONFLICT (account_code) DO NOTHING;

-- REVENUE (4xxx)
INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, status, balance, currency) VALUES
('a0000004-0000-0000-0000-000000000001', '4001', 'Sales Revenue', 'revenue', 'active', 0, 'IDR')
ON CONFLICT (account_code) DO NOTHING;

-- EXPENSES (5xxx)
INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, status, balance, currency) VALUES
('a0000005-0000-0000-0000-000000000001', '5001', 'Cost of Goods Sold', 'expense', 'active', 0, 'IDR'),
('a0000005-0000-0000-0000-000000000002', '5002', 'Raw Material Expense', 'expense', 'active', 0, 'IDR'),
('a0000005-0000-0000-0000-000000000003', '5003', 'Salary Expense', 'expense', 'active', 0, 'IDR'),
('a0000005-0000-0000-0000-000000000004', '5004', 'Utilities Expense', 'expense', 'active', 0, 'IDR'),
('a0000005-0000-0000-0000-000000000005', '5005', 'Rent Expense', 'expense', 'active', 0, 'IDR'),
('a0000005-0000-0000-0000-000000000006', '5006', 'Depreciation Expense', 'expense', 'active', 0, 'IDR')
ON CONFLICT (account_code) DO NOTHING;

-- ============================================================================
-- PART 3: INSERT SAMPLE INVENTORY ITEMS
-- ============================================================================

INSERT INTO inventory (id, item_code, item_name, description, unit, quantity, unit_cost, total_value, status) VALUES
('i0000001-0000-0000-0000-000000000001', 'INV001', 'Nasi Putih', 'Beras putih untuk burjo', 'kg', 0, 0, 0, 'active'),
('i0000001-0000-0000-0000-000000000002', 'INV002', 'Ayam', 'Ayam kampung untuk soto', 'kg', 0, 0, 0, 'active'),
('i0000001-0000-0000-0000-000000000003', 'INV003', 'Sayuran', 'Sayuran untuk gado-gado', 'kg', 0, 0, 0, 'active'),
('i0000001-0000-0000-0000-000000000004', 'INV004', 'Bumbu Dapur', 'Bumbu masakan', 'kg', 0, 0, 0, 'active'),
('i0000001-0000-0000-0000-000000000005', 'INV005', 'Minyak Goreng', 'Minyak untuk memasak', 'liter', 0, 0, 0, 'active')
ON CONFLICT (item_code) DO NOTHING;

-- ============================================================================
-- PART 4: INSERT SAMPLE JOURNAL ENTRIES (Realistic Burjo Transactions)
-- ============================================================================

-- Transaction 1: Owner Capital Injection - Rp 5,000,000
-- Date: Start of business
INSERT INTO journal_entries (id, entry_number, date, description, status, reference_type, created_by) VALUES
('j0000001-0000-0000-0000-000000000001', 'JE-000001', CURRENT_DATE - INTERVAL '30 days', 'Owner capital injection', 'posted', 'capital', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (entry_number) DO NOTHING;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_code, debit_amount, credit_amount) VALUES
('l0000001-0000-0000-0000-000000000001', 'j0000001-0000-0000-0000-000000000001', '1001', 5000000.00, 0.00),
('l0000001-0000-0000-0000-000000000002', 'j0000001-0000-0000-0000-000000000001', '3001', 0.00, 5000000.00)
ON CONFLICT DO NOTHING;

-- Update account balances for Transaction 1
UPDATE chart_of_accounts SET balance = 5000000.00 WHERE account_code = '1001';
UPDATE chart_of_accounts SET balance = 5000000.00 WHERE account_code = '3001';

-- Transaction 2: Purchase Equipment - Rp 2,000,000
INSERT INTO journal_entries (id, entry_number, date, description, status, reference_type, created_by) VALUES
('j0000001-0000-0000-0000-000000000002', 'JE-000002', CURRENT_DATE - INTERVAL '29 days', 'Purchase cooking equipment', 'posted', 'purchase', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (entry_number) DO NOTHING;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_code, debit_amount, credit_amount) VALUES
('l0000001-0000-0000-0000-000000000003', 'j0000001-0000-0000-0000-000000000002', '1005', 2000000.00, 0.00),
('l0000001-0000-0000-0000-000000000004', 'j0000001-0000-0000-0000-000000000002', '1001', 0.00, 2000000.00)
ON CONFLICT DO NOTHING;

-- Update account balances
UPDATE chart_of_accounts SET balance = balance - 2000000.00 WHERE account_code = '1001';
UPDATE chart_of_accounts SET balance = 2000000.00 WHERE account_code = '1005';

-- Transaction 3: Purchase Raw Materials (Credit) - Rp 200,000
INSERT INTO journal_entries (id, entry_number, date, description, status, reference_type, created_by) VALUES
('j0000001-0000-0000-0000-000000000003', 'JE-000003', CURRENT_DATE - INTERVAL '25 days', 'Purchase raw materials on credit', 'posted', 'purchase', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (entry_number) DO NOTHING;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_code, debit_amount, credit_amount) VALUES
('l0000001-0000-0000-0000-000000000005', 'j0000001-0000-0000-0000-000000000003', '1004', 200000.00, 0.00),
('l0000001-0000-0000-0000-000000000006', 'j0000001-0000-0000-0000-000000000003', '2001', 0.00, 200000.00)
ON CONFLICT DO NOTHING;

UPDATE chart_of_accounts SET balance = 200000.00 WHERE account_code = '1004';
UPDATE chart_of_accounts SET balance = 200000.00 WHERE account_code = '2001';

-- Transaction 4: Cash Sales - Rp 150,000 (COGS Rp 50,000)
INSERT INTO journal_entries (id, entry_number, date, description, status, reference_type, created_by) VALUES
('j0000001-0000-0000-0000-000000000004', 'JE-000004', CURRENT_DATE - INTERVAL '20 days', 'Cash sales - Gado-gado & Soto Ayam', 'posted', 'sales', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (entry_number) DO NOTHING;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_code, debit_amount, credit_amount) VALUES
('l0000001-0000-0000-0000-000000000007', 'j0000001-0000-0000-0000-000000000004', '1001', 150000.00, 0.00),
('l0000001-0000-0000-0000-000000000008', 'j0000001-0000-0000-0000-000000000004', '4001', 0.00, 150000.00),
('l0000001-0000-0000-0000-000000000009', 'j0000001-0000-0000-0000-000000000004', '5001', 50000.00, 0.00),
('l0000001-0000-0000-0000-000000000010', 'j0000001-0000-0000-0000-000000000004', '1004', 0.00, 50000.00)
ON CONFLICT DO NOTHING;

UPDATE chart_of_accounts SET balance = balance + 150000.00 WHERE account_code = '1001';
UPDATE chart_of_accounts SET balance = 150000.00 WHERE account_code = '4001';
UPDATE chart_of_accounts SET balance = 50000.00 WHERE account_code = '5001';
UPDATE chart_of_accounts SET balance = balance - 50000.00 WHERE account_code = '1004';

-- Transaction 5: Credit Sales (Catering Order) - Rp 250,000
INSERT INTO journal_entries (id, entry_number, date, description, status, reference_type, created_by) VALUES
('j0000001-0000-0000-0000-000000000005', 'JE-000005', CURRENT_DATE - INTERVAL '18 days', 'Credit sales - Catering order', 'posted', 'sales', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (entry_number) DO NOTHING;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_code, debit_amount, credit_amount) VALUES
('l0000001-0000-0000-0000-000000000011', 'j0000001-0000-0000-0000-000000000005', '1003', 250000.00, 0.00),
('l0000001-0000-0000-0000-000000000012', 'j0000001-0000-0000-0000-000000000005', '4001', 0.00, 250000.00),
('l0000001-0000-0000-0000-000000000013', 'j0000001-0000-0000-0000-000000000005', '5001', 80000.00, 0.00),
('l0000001-0000-0000-0000-000000000014', 'j0000001-0000-0000-0000-000000000005', '1004', 0.00, 80000.00)
ON CONFLICT DO NOTHING;

UPDATE chart_of_accounts SET balance = 250000.00 WHERE account_code = '1003';
UPDATE chart_of_accounts SET balance = balance + 250000.00 WHERE account_code = '4001';
UPDATE chart_of_accounts SET balance = balance + 80000.00 WHERE account_code = '5001';
UPDATE chart_of_accounts SET balance = balance - 80000.00 WHERE account_code = '1004';

-- Transaction 6: Salary Payment - Rp 500,000
INSERT INTO journal_entries (id, entry_number, date, description, status, reference_type, created_by) VALUES
('j0000001-0000-0000-0000-000000000006', 'JE-000006', CURRENT_DATE - INTERVAL '15 days', 'Salary payment for staff', 'posted', 'expense', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (entry_number) DO NOTHING;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_code, debit_amount, credit_amount) VALUES
('l0000001-0000-0000-0000-000000000015', 'j0000001-0000-0000-0000-000000000006', '5003', 500000.00, 0.00),
('l0000001-0000-0000-0000-000000000016', 'j0000001-0000-0000-0000-000000000006', '1001', 0.00, 500000.00)
ON CONFLICT DO NOTHING;

UPDATE chart_of_accounts SET balance = 500000.00 WHERE account_code = '5003';
UPDATE chart_of_accounts SET balance = balance - 500000.00 WHERE account_code = '1001';

-- Transaction 7: Rent Payment - Rp 2,000,000
INSERT INTO journal_entries (id, entry_number, date, description, status, reference_type, created_by) VALUES
('j0000001-0000-0000-0000-000000000007', 'JE-000007', CURRENT_DATE - INTERVAL '14 days', 'Monthly rent payment', 'posted', 'expense', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (entry_number) DO NOTHING;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_code, debit_amount, credit_amount) VALUES
('l0000001-0000-0000-0000-000000000017', 'j0000001-0000-0000-0000-000000000007', '5005', 2000000.00, 0.00),
('l0000001-0000-0000-0000-000000000018', 'j0000001-0000-0000-0000-000000000007', '1001', 0.00, 2000000.00)
ON CONFLICT DO NOTHING;

UPDATE chart_of_accounts SET balance = 2000000.00 WHERE account_code = '5005';
UPDATE chart_of_accounts SET balance = balance - 2000000.00 WHERE account_code = '1001';

-- Transaction 8: Utilities Expense - Rp 50,000
INSERT INTO journal_entries (id, entry_number, date, description, status, reference_type, created_by) VALUES
('j0000001-0000-0000-0000-000000000008', 'JE-000008', CURRENT_DATE - INTERVAL '10 days', 'Electricity and water bill', 'posted', 'expense', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (entry_number) DO NOTHING;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_code, debit_amount, credit_amount) VALUES
('l0000001-0000-0000-0000-000000000019', 'j0000001-0000-0000-0000-000000000008', '5004', 50000.00, 0.00),
('l0000001-0000-0000-0000-000000000020', 'j0000001-0000-0000-0000-000000000008', '1001', 0.00, 50000.00)
ON CONFLICT DO NOTHING;

UPDATE chart_of_accounts SET balance = 50000.00 WHERE account_code = '5004';
UPDATE chart_of_accounts SET balance = balance - 50000.00 WHERE account_code = '1001';

-- Transaction 9: AR Collection - Rp 250,000
INSERT INTO journal_entries (id, entry_number, date, description, status, reference_type, created_by) VALUES
('j0000001-0000-0000-0000-000000000009', 'JE-000009', CURRENT_DATE - INTERVAL '5 days', 'Collect payment from catering customer', 'posted', 'ar_collection', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (entry_number) DO NOTHING;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_code, debit_amount, credit_amount) VALUES
('l0000001-0000-0000-0000-000000000021', 'j0000001-0000-0000-0000-000000000009', '1001', 250000.00, 0.00),
('l0000001-0000-0000-0000-000000000022', 'j0000001-0000-0000-0000-000000000009', '1003', 0.00, 250000.00)
ON CONFLICT DO NOTHING;

UPDATE chart_of_accounts SET balance = balance + 250000.00 WHERE account_code = '1001';
UPDATE chart_of_accounts SET balance = balance - 250000.00 WHERE account_code = '1003';

-- Transaction 10: Cash Sales - Rp 300,000
INSERT INTO journal_entries (id, entry_number, date, description, status, reference_type, created_by) VALUES
('j0000001-0000-0000-0000-000000000010', 'JE-000010', CURRENT_DATE - INTERVAL '3 days', 'Daily cash sales', 'posted', 'sales', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (entry_number) DO NOTHING;

INSERT INTO journal_entry_lines (id, journal_entry_id, account_code, debit_amount, credit_amount) VALUES
('l0000001-0000-0000-0000-000000000023', 'j0000001-0000-0000-0000-000000000010', '1001', 300000.00, 0.00),
('l0000001-0000-0000-0000-000000000024', 'j0000001-0000-0000-0000-000000000010', '4001', 0.00, 300000.00),
('l0000001-0000-0000-0000-000000000025', 'j0000001-0000-0000-0000-000000000010', '5001', 100000.00, 0.00),
('l0000001-0000-0000-0000-000000000026', 'j0000001-0000-0000-0000-000000000010', '1004', 0.00, 100000.00)
ON CONFLICT DO NOTHING;

UPDATE chart_of_accounts SET balance = balance + 300000.00 WHERE account_code = '1001';
UPDATE chart_of_accounts SET balance = balance + 300000.00 WHERE account_code = '4001';
UPDATE chart_of_accounts SET balance = balance + 100000.00 WHERE account_code = '5001';
UPDATE chart_of_accounts SET balance = balance - 100000.00 WHERE account_code = '1004';

-- ============================================================================
-- SUMMARY OF ACCOUNT BALANCES AFTER SAMPLE DATA
-- ============================================================================
-- Cash (1001): Should have positive balance after all transactions
-- Inventory (1004): Should have some remaining inventory
-- Sales Revenue (4001): Rp 700,000 (150k + 250k + 300k)
-- COGS (5001): Rp 230,000 (50k + 80k + 100k)
-- Gross Profit: Rp 470,000
-- Total Expenses: Rp 2,550,000 (Salary 500k + Rent 2,000k + Utilities 50k)
-- Net Income/Loss: (2,080,000) - Initial period loss expected
-- ============================================================================

-- Add a comment explaining the sample data
COMMENT ON TABLE journal_entries IS 'Journal entries include 10 sample transactions representing a month of Burjo operations';
