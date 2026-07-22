import { isAxiosError } from "axios";

import TRANSPORTATION_EXPENSES_API from "@/constants/api/transportation-expenses";
import PROPERTY_TYPES from "@/constants/properties";
import apiClient from "@/lib/api-client";
import { getCachedPropertyOptions } from "@/lib/properties";

import type {
  ApiResponse,
  CreateTransportationExpenseInput,
  DeleteResponse,
  TransportationExpense,
  TransportationExpensesData,
  TransportationExpensesQuery,
  UpdateTransportationExpenseInput,
} from "./models";

export const getTransportationExpenseCategoryLabel = (category: string) =>
  getCachedPropertyOptions(PROPERTY_TYPES.TRAVEL_EXPENSES).find(
    (option) => option.value === category,
  )?.label ?? category;

export const formatTransportationExpenseDate = (value: string) =>
  new Intl.DateTimeFormat("en-EN", { dateStyle: "medium" }).format(
    new Date(value),
  );

export const getTransportationExpenses = async (
  query: TransportationExpensesQuery = {},
) => {
  const response = await apiClient.get<ApiResponse<TransportationExpensesData>>(
    TRANSPORTATION_EXPENSES_API.ROOT,
    { params: query },
  );

  return response.data.data;
};

export const createTransportationExpense = async (
  input: CreateTransportationExpenseInput,
) => {
  const response = await apiClient.post<ApiResponse<TransportationExpense>>(
    TRANSPORTATION_EXPENSES_API.ROOT,
    input,
  );

  return response.data.data;
};

export const updateTransportationExpense = async (
  id: string,
  input: UpdateTransportationExpenseInput,
) => {
  const response = await apiClient.put<ApiResponse<TransportationExpense>>(
    TRANSPORTATION_EXPENSES_API.DETAIL(id),
    input,
  );

  return response.data.data;
};

export const deleteTransportationExpense = async (id: string) => {
  const response = await apiClient.delete<DeleteResponse>(
    TRANSPORTATION_EXPENSES_API.DETAIL(id),
  );

  return response.data;
};

export const getTransportationExpensesErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to load transportation expenses.";
};
