// Formatting utilities for currency, dates, and numbers

import { BUSINESS_CONSTANTS } from '../config/constants';

export const formatCurrency = (amount: number, currency: string = BUSINESS_CONSTANTS.DEFAULT_CURRENCY): string => {
  const formattedAmount = amount.toLocaleString('id-ID', {
    minimumFractionDigits: BUSINESS_CONSTANTS.DECIMAL_PLACES,
    maximumFractionDigits: BUSINESS_CONSTANTS.DECIMAL_PLACES,
  });
  
  if (currency === 'IDR') {
    return `${BUSINESS_CONSTANTS.CURRENCY_SYMBOL} ${formattedAmount}`;
  }
  
  return `${currency} ${formattedAmount}`;
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatAccountCode = (code: string): string => {
  return code.padStart(BUSINESS_CONSTANTS.ACCOUNT_CODE_LENGTH, '0');
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const parseAmount = (amount: string): number => {
  // Remove currency symbols and thousand separators
  const cleanAmount = amount.replace(/[^\d.-]/g, '');
  return parseFloat(cleanAmount) || 0;
};

export const toISODate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
};
