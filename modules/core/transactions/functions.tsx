import { isAxiosError } from "axios";

import TRANSACTIONS_API from "@/constants/api/transactions";
import PROPERTY_TYPES from "@/constants/properties";
import apiClient from "@/lib/api-client";
import { getCachedPropertyOptions } from "@/lib/properties";

import {
  type ApiResponse,
  type CreateTransactionInput,
  type DeleteResponse,
  type Transaction,
  type TransactionsData,
  type TransactionsQuery,
  type TransactionType,
  type UpdateTransactionInput,
} from "./models";

export const getCategoryPropertyCode = (type: TransactionType) =>
  type === "income"
    ? PROPERTY_TYPES.TRANSACTION_INCOME_CATEGORY
    : PROPERTY_TYPES.TRANSACTION_EXPENSE_CATEGORY;

export const getCategoryLabel = (type: TransactionType, category: string) => {
  const options = getCachedPropertyOptions(getCategoryPropertyCode(type));

  return options.find((option) => option.value === category)?.label ?? category;
};

// The API stores every amount as an integer in satang, the UI works in baht.
export const satangToBaht = (amount: number) => amount / 100;

export const bahtToSatang = (amount: number) => Math.round(amount * 100);

export const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-EN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(satangToBaht(amount));

export const formatTransactionDate = (value: string) =>
  new Intl.DateTimeFormat("en-EN", {
    dateStyle: "medium",
  }).format(new Date(value));

export const getTransactions = async (query: TransactionsQuery = {}) => {
  const response = await apiClient.get<ApiResponse<TransactionsData>>(
    TRANSACTIONS_API.ROOT,
    {
      params: query,
    }
  );

  return response.data.data;
};

export const getTransaction = async (id: string) => {
  const response = await apiClient.get<ApiResponse<Transaction>>(
    TRANSACTIONS_API.DETAIL(id)
  );

  return response.data.data;
};

export const createTransaction = async (input: CreateTransactionInput) => {
  const response = await apiClient.post<ApiResponse<Transaction>>(
    TRANSACTIONS_API.ROOT,
    input
  );

  return response.data.data;
};

export const updateTransaction = async (
  id: string,
  input: UpdateTransactionInput
) => {
  const response = await apiClient.put<ApiResponse<Transaction>>(
    TRANSACTIONS_API.DETAIL(id),
    input
  );

  return response.data.data;
};

export const deleteTransaction = async (id: string) => {
  const response = await apiClient.delete<DeleteResponse>(
    TRANSACTIONS_API.DETAIL(id)
  );

  return response.data;
};

export const getTransactionsErrorMessage = (error: unknown) => {
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

  return "Failed to load transactions.";
};
