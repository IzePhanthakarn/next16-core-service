import PROPERTIES_API from "@/constants/api/properties";
import apiClient from "./api-client";
import { isAxiosError } from "axios";

export type CachedPropertyOption = {
  label: string;
  value: string;
};

export type PropertyOption = {
  id: string;
  sort_order: number;
  label: string;
  value: string;
  is_active: boolean;
};

export type PropertyWithOptions = {
  id: string;
  name: string;
  code: string;
  description: string;
  options: PropertyOption[];
};

type PropertyWithOptionsResponse = {
  status: string;
  code: number;
  message: string;
  data: PropertyWithOptions;
};

export const getCachedPropertyOptions = (code: string): CachedPropertyOption[] => {
  try {
    const cached = sessionStorage.getItem(code);
    return cached ? (JSON.parse(cached) as CachedPropertyOption[]) : [];
  } catch {
    return [];
  }
};

export const getPropertyOptionsByCode = async (code: string): Promise<CachedPropertyOption[]> => {
  const cached = sessionStorage.getItem(code);
  if (cached) {
    try {
      return JSON.parse(cached) as CachedPropertyOption[];
    } catch {
      // ignore parse error, re-fetch
    }
  }

  const response = await apiClient.get<PropertyWithOptionsResponse>(
    PROPERTIES_API.BY_CODE(code),
  );

  const options: CachedPropertyOption[] = response.data.data.options
    .filter((opt) => opt.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(({ label, value }) => ({ label, value }));

  sessionStorage.setItem(code, JSON.stringify(options));

  return options;
};

export const getPropertiesErrorMessage = (error: unknown) => {
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

  return "Failed to load properties.";
};
