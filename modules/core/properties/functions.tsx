import { isAxiosError } from "axios";

import PROPERTIES_API from "@/constants/api/properties";
import apiClient from "@/lib/api-client";

import {
  type CachedPropertyOption,
  type CreatePropertyInput,
  type PropertiesQuery,
  type PropertiesResponse,
  type Property,
  type PropertyWithOptions,
} from "./models";

type PropertyResponse = {
  status: string;
  code: number;
  message: string;
  data: Property;
};

export const formatPropertyDate = (value: string) =>
  new Intl.DateTimeFormat("en-EN", {
    dateStyle: "medium",
  }).format(new Date(value));

export const getProperties = async (query: PropertiesQuery = {}) => {
  const response = await apiClient.get<PropertiesResponse>(
    PROPERTIES_API.ROOT,
    {
      params: query,
    },
  );

  return response.data.data;
};

export const createProperty = async (input: CreatePropertyInput) => {
  const response = await apiClient.post<PropertyResponse>(
    PROPERTIES_API.ROOT,
    input,
  );

  return response.data.data;
};

export const deleteProperty = async (id: string) => {
  const response = await apiClient.delete<Omit<PropertyResponse, "data">>(
    `${PROPERTIES_API.ROOT}/${id}`,
  );

  return response.data;
};

type PropertyWithOptionsResponse = {
  status: string;
  code: number;
  message: string;
  data: PropertyWithOptions;
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
