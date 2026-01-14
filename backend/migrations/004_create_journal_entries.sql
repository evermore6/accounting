-- 004_create_journal_entries.sql
-- Create journal entries table for double-entry bookkeeping

CREATE TYPE entry_type AS ENUM ('debit', 'credit');

CREATE TABLE journal_entries (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  account_id INTEGER REFERENCES chart_of_accounts(id) NOT NULL,
  entry_type entry_type NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_transaction ON journal_entries(transaction_id);
CREATE INDEX idx_journal_account ON journal_entries(account_id);
CREATE INDEX idx_journal_date ON journal_entries(entry_date);

-- Create a function to validate balanced entries
CREATE OR REPLACE FUNCTION validate_journal_balance()
RETURNS TRIGGER AS $$
DECLARE
  debit_sum DECIMAL(15, 2);
  credit_sum DECIMAL(15, 2);
BEGIN
  SELECT 
    COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0)
  INTO debit_sum, credit_sum
  FROM journal_entries
  WHERE transaction_id = NEW.transaction_id;

  IF debit_sum != credit_sum THEN
    RAISE EXCEPTION 'Journal entries must be balanced. Debit: %, Credit: %', debit_sum, credit_sum;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Trigger will be created after initial data load to avoid issues
