import React, { useEffect, useState } from 'react';
import { journalService } from '../services/transactionService';
import { formatCurrency, formatDate } from '../utils/formatters';

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await journalService.getJournalEntries();
        setEntries(data);
      } catch (error) {
        console.error('Failed to load journal entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Journal Entries</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(entry.entry_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{entry.reference_number}</td>
                <td className="px-6 py-4 text-sm">
                  {entry.account_code} - {entry.account_name}
                </td>
                <td className="px-6 py-4 text-sm">{entry.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {entry.entry_type === 'debit' ? formatCurrency(entry.amount) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {entry.entry_type === 'credit' ? formatCurrency(entry.amount) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Journal;
