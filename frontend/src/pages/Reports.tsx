import React, { useState } from 'react';
import { reportService } from '../services/reportService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from '../components/Common/Button';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<'income' | 'balance' | 'cashflow' | 'trial'>('income');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');

  const generateReport = async () => {
    setIsLoading(true);
    try {
      let data;
      switch (reportType) {
        case 'income':
          data = await reportService.getIncomeStatement(startDate, endDate);
          break;
        case 'balance':
          data = await reportService.getBalanceSheet(endDate);
          break;
        case 'cashflow':
          data = await reportService.getCashFlow(startDate, endDate);
          break;
        case 'trial':
          data = await reportService.getTrialBalance(endDate);
          break;
      }
      setReportData(data);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="income">Income Statement</option>
              <option value="balance">Balance Sheet</option>
              <option value="cashflow">Cash Flow</option>
              <option value="trial">Trial Balance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex items-end">
            <Button onClick={generateReport} disabled={isLoading} className="w-full">
              {isLoading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </div>
      </div>

      {reportData && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            {reportType === 'income' && 'Income Statement'}
            {reportType === 'balance' && 'Balance Sheet'}
            {reportType === 'cashflow' && 'Cash Flow Statement'}
            {reportType === 'trial' && 'Trial Balance'}
          </h2>

          {reportType === 'income' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Revenue</h3>
                {reportData.revenues?.map((item: any) => (
                  <div key={item.account_code} className="flex justify-between py-1">
                    <span>{item.account_name}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 font-semibold border-t mt-2">
                  <span>Total Revenue</span>
                  <span>{formatCurrency(reportData.totalRevenue)}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Expenses</h3>
                {reportData.expenses?.map((item: any) => (
                  <div key={item.account_code} className="flex justify-between py-1">
                    <span>{item.account_name}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 font-semibold border-t mt-2">
                  <span>Total Expenses</span>
                  <span>{formatCurrency(reportData.totalExpenses)}</span>
                </div>
              </div>

              <div className="flex justify-between py-2 font-bold text-lg border-t-2">
                <span>Net Income</span>
                <span className={reportData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(reportData.netIncome)}
                </span>
              </div>
            </div>
          )}

          {reportType === 'balance' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Assets</h3>
                {reportData.assets?.map((item: any) => (
                  <div key={item.account_code} className="flex justify-between py-1">
                    <span>{item.account_name}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 font-semibold border-t mt-2">
                  <span>Total Assets</span>
                  <span>{formatCurrency(reportData.totalAssets)}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Liabilities</h3>
                {reportData.liabilities?.map((item: any) => (
                  <div key={item.account_code} className="flex justify-between py-1">
                    <span>{item.account_name}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 font-semibold border-t mt-2">
                  <span>Total Liabilities</span>
                  <span>{formatCurrency(reportData.totalLiabilities)}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Equity</h3>
                {reportData.equity?.map((item: any) => (
                  <div key={item.account_code} className="flex justify-between py-1">
                    <span>{item.account_name}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 font-semibold border-t mt-2">
                  <span>Total Equity</span>
                  <span>{formatCurrency(reportData.totalEquity)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
