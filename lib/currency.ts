// The API stores every amount as an integer in satang, the UI works in baht.
export const satangToBaht = (amount: number) => amount / 100;

export const bahtToSatang = (amount: number) => Math.round(amount * 100);

export const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-EN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(satangToBaht(amount));
