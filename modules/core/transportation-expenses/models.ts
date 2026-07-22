export type TransportationExpense = {
  id: string;
  user_id: string;
  transaction_id: string | null;
  category: string;
  amount: number;
  title: string;
  note: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
};

export type TransportationExpenseCategorySplit = {
  category: string;
  total_amount: number;
  count: number;
  percentage: number;
};

export type TransportationExpenseStats = {
  total_expense: number;
  average_per_active_day: number;
  expense_count: number;
  category_split: TransportationExpenseCategorySplit[];
};

export type TransportationExpensesData = {
  items: TransportationExpense[];
  total_items: number;
  total_pages: number;
  current_page: number;
  stats: TransportationExpenseStats;
};

export type ApiResponse<T> = {
  status: string;
  code: number;
  message: string;
  data: T;
};

export type DeleteResponse = Omit<ApiResponse<never>, "data">;

export type TransportationExpensesQuery = {
  page?: number;
  limit?: number;
  category?: string;
  keyword?: string;
  month?: string;
  year?: string;
};

export type CreateTransportationExpenseInput = {
  category: string;
  amount: number;
  title: string;
  note: string | null;
  expense_date: string;
  sync_to_transaction: boolean;
};

export type UpdateTransportationExpenseInput = CreateTransportationExpenseInput;

export const emptyTransportationExpenses: TransportationExpensesData = {
  items: [],
  total_items: 0,
  total_pages: 1,
  current_page: 1,
  stats: {
    total_expense: 0,
    average_per_active_day: 0,
    expense_count: 0,
    category_split: [],
  },
};

export const itemPerPageOptions = [10, 20, 50] as const;
export const allFilterValue = "all";
