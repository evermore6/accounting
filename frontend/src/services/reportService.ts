import api from './api';

export const reportService = {
  async getTrialBalance(asOfDate?: string) {
    const response = await api.get('/reports/trial-balance', {
      params: { as_of_date: asOfDate }
    });
    return response.data;
  },

  async getIncomeStatement(startDate: string, endDate: string) {
    const response = await api.get('/reports/income-statement', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getBalanceSheet(asOfDate?: string) {
    const response = await api.get('/reports/balance-sheet', {
      params: { as_of_date: asOfDate }
    });
    return response.data;
  },

  async getCashFlow(startDate: string, endDate: string) {
    const response = await api.get('/reports/cash-flow', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  }
};
