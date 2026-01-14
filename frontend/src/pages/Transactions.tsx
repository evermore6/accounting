import React, { useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from '../components/Common/Button';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();

  const fetchTransactions = async () => {
    try {
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch (error) {
      addNotification('Failed to load transactions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await transactionService.approveTransaction(id);
      addNotification('Transaction approved successfully', 'success');
      fetchTransactions();
    } catch (error) {
      addNotification('Failed to approve transaction', 'error');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await transactionService.rejectTransaction(id);
      addNotification('Transaction rejected successfully', 'success');
      fetchTransactions();
    } catch (error) {
      addNotification('Failed to reject transaction', 'error');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <Button>New Transaction</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.reference_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(tx.transaction_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.transaction_type}</td>
                <td className="px-6 py-4 text-sm">{tx.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(tx.total_amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${
                    tx.status === 'posted' ? 'bg-green-100 text-green-800' :
                    tx.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {tx.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="success" onClick={() => handleApprove(tx.id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleReject(tx.id)}>
                        Reject
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
