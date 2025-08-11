export type Transaction = {
  id: string; // Changed to string to accommodate Firestore document IDs
  type: string;
  description: string;
  amount: number;
  date: string;
  currency: 'USDT' | 'BS';
  usdtUsed?: number;
};