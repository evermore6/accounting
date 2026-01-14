-- Migration 004: Create journal entries tables

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY,
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'posted')),
    reference_type VARCHAR(50),
    reference_id UUID,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Create journal_entry_lines table
CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY,
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_code VARCHAR(10) NOT NULL REFERENCES chart_of_accounts(account_code),
    debit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    credit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_journal_debit_credit CHECK (debit_amount >= 0 AND credit_amount >= 0),
    CONSTRAINT chk_journal_not_both CHECK (debit_amount = 0 OR credit_amount = 0)
);

-- Create indexes
CREATE INDEX idx_journal_entries_number ON journal_entries(entry_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_journal_entries_date ON journal_entries(date) WHERE deleted_at IS NULL;
CREATE INDEX idx_journal_entries_status ON journal_entries(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_journal_entries_reference ON journal_entries(reference_type, reference_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_journal_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_lines_account ON journal_entry_lines(account_code);

-- Add comments
COMMENT ON TABLE journal_entries IS 'Journal entry headers - double-entry bookkeeping records';
COMMENT ON TABLE journal_entry_lines IS 'Journal entry lines - debit and credit entries';
COMMENT ON COLUMN journal_entries.status IS 'Entry status: draft, pending, approved, rejected, posted';
COMMENT ON COLUMN journal_entries.reference_type IS 'Type of referenced transaction: sales, purchase, expense, etc.';
