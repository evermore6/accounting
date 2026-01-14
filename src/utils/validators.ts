// Input validation utilities

import { ERROR_MESSAGES } from '../config/constants';

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount >= 0 && isFinite(amount);
};

export const isValidAccountCode = (code: string): boolean => {
  const codeRegex = /^\d{4}$/;
  return codeRegex.test(code);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password);
};

export const validateDebitCreditBalance = (debit: number, credit: number): boolean => {
  return Math.abs(debit - credit) < 0.01; // Allow for floating point precision
};

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} ${ERROR_MESSAGES.REQUIRED_FIELD}`;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  if (!isValidEmail(email)) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }
  return null;
};

export const validateAmount = (amount: number, fieldName: string): string | null => {
  if (amount === undefined || amount === null) {
    return `${fieldName} ${ERROR_MESSAGES.REQUIRED_FIELD}`;
  }
  if (!isValidAmount(amount)) {
    return ERROR_MESSAGES.INVALID_AMOUNT;
  }
  return null;
};
