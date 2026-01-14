import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import { reportService } from '../services/reportService';
import { formatCurrency, formatDate } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactions, balanceSheet] = await Promise.all([
          transactionService.getTransactions({ limit: 5 }),
          reportService.getBalanceSheet()
        ]);

        setRecentTransactions(transactions);
        setStats({
          totalAssets: balanceSheet.totalAssets,
          totalLiabilities: balanceSheet.totalLiabilities,
          totalEquity: balanceSheet.totalEquity
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome, {user?.full_name}!
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Assets</h3>
          <p className="text-2xl font-bold text-primary-600">
            {formatCurrency(stats?.totalAssets || 0)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Liabilities</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(stats?.totalLiabilities || 0)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Equity</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats?.totalEquity || 0)}
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="p-6">
          {recentTransactions.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Reference</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{tx.reference_number}</td>
                    <td className="py-2">{formatDate(tx.transaction_date)}</td>
                    <td className="py-2">{tx.description}</td>
                    <td className="py-2 text-right">{formatCurrency(tx.total_amount)}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        tx.status === 'posted' ? 'bg-green-100 text-green-800' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No recent transactions</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
