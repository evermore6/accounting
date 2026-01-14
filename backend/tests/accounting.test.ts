import { isBalanced } from '../src/utils/validators';
import { calculateBalance } from '../src/utils/calculations';

describe('Accounting Utilities', () => {
  describe('isBalanced', () => {
    it('should return true for balanced entries', () => {
      const entries = [
        { entry_type: 'debit', amount: 100 },
        { entry_type: 'credit', amount: 100 }
      ];
      expect(isBalanced(entries)).toBe(true);
    });

    it('should return false for unbalanced entries', () => {
      const entries = [
        { entry_type: 'debit', amount: 100 },
        { entry_type: 'credit', amount: 50 }
      ];
      expect(isBalanced(entries)).toBe(false);
    });
  });

  describe('calculateBalance', () => {
    it('should calculate debit balance correctly', () => {
      const balance = calculateBalance(100, 50, 'debit');
      expect(balance).toBe(50);
    });

    it('should calculate credit balance correctly', () => {
      const balance = calculateBalance(50, 100, 'credit');
      expect(balance).toBe(50);
    });
  });
});
