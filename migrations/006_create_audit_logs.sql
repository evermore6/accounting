-- Migration 006: Create audit logs table

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_body TEXT,
    response_status INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Add comments
COMMENT ON TABLE audit_logs IS 'Audit trail of all user actions in the system';
COMMENT ON COLUMN audit_logs.action IS 'HTTP method and path (e.g., POST /api/transactions)';
COMMENT ON COLUMN audit_logs.resource IS 'Resource being accessed (e.g., transactions, users)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the specific resource if applicable';
