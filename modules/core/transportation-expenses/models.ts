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

export type TransportationExpensesData = {
  items: TransportationExpense[];
  total_items: number;
  total_pages: number;
  current_page: number;
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
};

export const itemPerPageOptions = [10, 20, 50] as const;
export const allFilterValue = "all";
