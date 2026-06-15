import { isAxiosError } from "axios";

import PROPERTIES_API from "@/constants/api/properties";
import apiClient from "@/lib/api-client";

import {
  type CreatePropertyInput,
  type PropertiesQuery,
  type PropertiesResponse,
  type Property,
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
