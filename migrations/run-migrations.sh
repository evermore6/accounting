#!/bin/bash

# Database Migration Runner for Burjo Accounting System

echo "========================================"
echo "  Burjo Accounting - Database Setup    "
echo "========================================"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set default values
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-burjo_accounting}
DB_USER=${DB_USER:-postgres}

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Create database if it doesn't exist
echo "Creating database if not exists..."
PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || true

# Run migrations in order
echo ""
echo "Running migrations..."
echo ""

for migration in migrations/*.sql; do
    echo "Applying: $migration"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration"
    
    if [ $? -eq 0 ]; then
        echo "✓ Success"
    else
        echo "✗ Failed"
        exit 1
    fi
    echo ""
done

echo "========================================"
echo "  Database setup completed!             "
echo "========================================"
echo ""
echo "Sample users created:"
echo "  - pakbudi@burjo.local (Owner/Admin)"
echo "  - siti@burjo.local (Accountant)"
echo "  - rino@burjo.local (Cashier)"
echo "  - rina@burjo.local (Cashier)"
echo ""
echo "Default password: Password123!"
echo ""
