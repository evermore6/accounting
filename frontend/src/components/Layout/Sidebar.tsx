import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `block px-4 py-2 rounded-lg ${
      isActive(path)
        ? 'bg-primary-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  const canViewReports = ['owner', 'admin_accounting', 'viewer'].includes(user?.role || '');
  const canManageUsers = ['owner', 'admin_accounting'].includes(user?.role || '');

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      <nav className="p-4 space-y-2">
        <Link to="/dashboard" className={linkClass('/dashboard')}>
          Dashboard
        </Link>
        
        <Link to="/transactions" className={linkClass('/transactions')}>
          Transactions
        </Link>
        
        <Link to="/journal" className={linkClass('/journal')}>
          Journal Entries
        </Link>
        
        {canViewReports && (
          <Link to="/reports" className={linkClass('/reports')}>
            Financial Reports
          </Link>
        )}
        
        <Link to="/inventory" className={linkClass('/inventory')}>
          Inventory
        </Link>
        
        {canManageUsers && (
          <Link to="/users" className={linkClass('/users')}>
            User Management
          </Link>
        )}
      </nav>
    </aside>
  );
};
