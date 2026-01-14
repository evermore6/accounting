import React, { useEffect, useState } from 'react';
import { inventoryService } from '../services/transactionService';
import { formatCurrency } from '../utils/formatters';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await inventoryService.getInventory();
        setItems(data);
      } catch (error) {
        console.error('Failed to load inventory:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Min Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.item_code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.item_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.unit_of_measure}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{item.current_quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(item.unit_cost)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(item.total_value)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{item.minimum_stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.is_low_stock ? (
                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Low Stock</span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">OK</span>
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

export default Inventory;
