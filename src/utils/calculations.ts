// Accounting calculations utilities

export const roundAmount = (amount: number, decimals: number = 2): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.round(amount * multiplier) / multiplier;
};

export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return roundAmount((part / total) * 100);
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return roundAmount(((current - previous) / previous) * 100);
};

export const sumArray = (numbers: number[]): number => {
  return roundAmount(numbers.reduce((sum, num) => sum + num, 0));
};

export const calculateNetIncome = (revenue: number, expenses: number): number => {
  return roundAmount(revenue - expenses);
};

export const calculateEquity = (assets: number, liabilities: number): number => {
  return roundAmount(assets - liabilities);
};

export const calculateWorkingCapital = (currentAssets: number, currentLiabilities: number): number => {
  return roundAmount(currentAssets - currentLiabilities);
};

export const calculateCurrentRatio = (currentAssets: number, currentLiabilities: number): number => {
  if (currentLiabilities === 0) return 0;
  return roundAmount(currentAssets / currentLiabilities);
};

export const calculateProfitMargin = (netIncome: number, revenue: number): number => {
  if (revenue === 0) return 0;
  return roundAmount((netIncome / revenue) * 100);
};

export const calculateROA = (netIncome: number, totalAssets: number): number => {
  if (totalAssets === 0) return 0;
  return roundAmount((netIncome / totalAssets) * 100);
};

export const calculateROE = (netIncome: number, totalEquity: number): number => {
  if (totalEquity === 0) return 0;
  return roundAmount((netIncome / totalEquity) * 100);
};

// FIFO inventory cost calculation
export interface InventoryLayer {
  quantity: number;
  unitCost: number;
  remainingQuantity: number;
}

export const calculateFIFOCost = (
  layers: InventoryLayer[],
  quantityToSell: number
): { cost: number; updatedLayers: InventoryLayer[] } => {
  let remainingQuantity = quantityToSell;
  let totalCost = 0;
  const updatedLayers: InventoryLayer[] = [];

  for (const layer of layers) {
    if (remainingQuantity <= 0) {
      updatedLayers.push({ ...layer });
      continue;
    }

    const quantityFromThisLayer = Math.min(layer.remainingQuantity, remainingQuantity);
    totalCost += quantityFromThisLayer * layer.unitCost;
    remainingQuantity -= quantityFromThisLayer;

    if (layer.remainingQuantity > quantityFromThisLayer) {
      updatedLayers.push({
        ...layer,
        remainingQuantity: layer.remainingQuantity - quantityFromThisLayer,
      });
    }
  }

  return {
    cost: roundAmount(totalCost),
    updatedLayers,
  };
};
