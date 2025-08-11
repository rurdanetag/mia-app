export type Transaction = {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string; // ISO Date String
  currency: 'USDT' | 'BS';
  usdtUsed?: number;
};
