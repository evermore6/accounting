export const calculateBalance = (
  debits: number,
  credits: number,
  normalBalance: 'debit' | 'credit'
): number => {
  if (normalBalance === 'debit') {
    return debits - credits;
  }
  return credits - debits;
};

export const calculateFIFOCost = (
  purchases: Array<{ quantity: number; unit_cost: number; remaining_quantity: number }>,
  usageQuantity: number
): { cost: number; updatedPurchases: any[] } => {
  let remainingUsage = usageQuantity;
  let totalCost = 0;
  const updatedPurchases = [...purchases];

  for (let i = 0; i < updatedPurchases.length && remainingUsage > 0; i++) {
    const purchase = updatedPurchases[i];
    const availableQty = purchase.remaining_quantity || purchase.quantity;

    if (availableQty > 0) {
      const qtyToUse = Math.min(availableQty, remainingUsage);
      totalCost += qtyToUse * purchase.unit_cost;
      purchase.remaining_quantity = availableQty - qtyToUse;
      remainingUsage -= qtyToUse;
    }
  }

  return { cost: totalCost, updatedPurchases };
};

export const calculateDepreciation = (
  cost: number,
  salvageValue: number,
  usefulLife: number,
  method: 'straight_line' | 'declining_balance' = 'straight_line'
): number => {
  if (method === 'straight_line') {
    return (cost - salvageValue) / usefulLife;
  }
  // Declining balance method
  const rate = 2 / usefulLife;
  return cost * rate;
};

export const calculateNetIncome = (revenues: number, expenses: number): number => {
  return revenues - expenses;
};

export const calculateWorkingCapital = (currentAssets: number, currentLiabilities: number): number => {
  return currentAssets - currentLiabilities;
};
