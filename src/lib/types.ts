export type Transaction = {
  id: number;
  type: string;
  description: string;
  amount: number;
  date: string;
  currency: 'USDT' | 'BS';
  usdtUsed?: number;
};
