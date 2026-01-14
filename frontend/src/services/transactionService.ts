import api from './api';

export const transactionService = {
  async getTransactions(filters?: any) {
    const response = await api.get('/transactions', { params: filters });
    return response.data.transactions;
  },

  async getTransactionById(id: number) {
    const response = await api.get(`/transactions/${id}`);
    return response.data.transaction;
  },

  async createTransaction(data: any) {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  async approveTransaction(id: number) {
    const response = await api.put(`/transactions/${id}/approve`);
    return response.data;
  },

  async rejectTransaction(id: number) {
    const response = await api.put(`/transactions/${id}/reject`);
    return response.data;
  }
};

export const journalService = {
  async getJournalEntries(filters?: any) {
    const response = await api.get('/journals', { params: filters });
    return response.data.entries;
  },

  async getGeneralLedger(accountId: number, startDate?: string, endDate?: string) {
    const response = await api.get(`/journals/ledger/${accountId}`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async createManualJournal(data: any) {
    const response = await api.post('/journals/manual', data);
    return response.data;
  }
};

export const inventoryService = {
  async getInventory(lowStock?: boolean) {
    const response = await api.get('/inventory', { params: { low_stock: lowStock } });
    return response.data.items;
  },

  async createInventoryItem(data: any) {
    const response = await api.post('/inventory', data);
    return response.data;
  },

  async recordPurchase(data: any) {
    const response = await api.post('/inventory/purchase', data);
    return response.data;
  },

  async recordUsage(data: any) {
    const response = await api.post('/inventory/usage', data);
    return response.data;
  },

  async getInventoryReport() {
    const response = await api.get('/inventory/report');
    return response.data.report;
  }
};
