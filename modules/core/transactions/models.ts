export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  title: string;
  note: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
};

export type TransactionTopExpenseCategory = {
  category: string;
  total_amount: number;
  count: number;
};

export type TransactionStats = {
  total_income: number;
  total_expense: number;
  top_expense_category: TransactionTopExpenseCategory[];
  average_daily_expense: number;
  transaction_count: number;
};

export type TransactionsData = {
  items: Transaction[];
  total_items: number;
  total_pages: number;
  current_page: number;
  stats: TransactionStats;
};

export type ApiResponse<T> = {
  status: string;
  code: number;
  message: string;
  data: T;
};

export type DeleteResponse = {
  status: string;
  code: number;
  message: string;
};

export type TransactionsQuery = {
  page?: number;
  limit?: number;
  type?: TransactionType;
  category?: string;
  keyword?: string;
  month?: string;
  year?: string;
};

export type CreateTransactionInput = {
  type: TransactionType;
  amount: number;
  category: string;
  title: string;
  note: string | null;
  transaction_date: string;
};

export type UpdateTransactionInput = CreateTransactionInput;

export const emptyTransactions: TransactionsData = {
  items: [],
  total_items: 0,
  total_pages: 1,
  current_page: 1,
  stats: {
    total_income: 0,
    total_expense: 0,
    top_expense_category: [],
    average_daily_expense: 0,
    transaction_count: 0,
  },
};

export const itemPerPageOptions = [10, 20, 50] as const;

// Sentinel for the "no filter" choice on the type and category selects, since
// a Select item cannot hold an empty value.
export const allFilterValue = "all";
