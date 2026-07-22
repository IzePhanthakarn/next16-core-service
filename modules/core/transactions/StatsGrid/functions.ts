export const getExpenseBarWidth = (amount: number, highestAmount: number) => {
  if (highestAmount <= 0) {
    return 0;
  }

  return Math.round((amount / highestAmount) * 100);
};
