import { isAxiosError } from "axios";

import PROPERTIES_API from "@/constants/api/properties";
import apiClient from "@/lib/api-client";

import type {
  CreatePropertyOptionInput,
  PropertyDetail,
  PropertyDetailResponse,
  PropertyOption,
  UpdatePropertyInput,
  UpdatePropertyOptionInput,
} from "./models";

type UpdatePropertyResponse = {
  status: string;
  code: number;
  message: string;
  data: PropertyDetail;
};

export const getPropertyDetail = async (id: string) => {
  const response = await apiClient.get<PropertyDetailResponse>(
    PROPERTIES_API.DETAIL(id),
  );

  return response.data.data;
};

export const updateProperty = async (
  id: string,
  input: UpdatePropertyInput,
) => {
  const response = await apiClient.put<UpdatePropertyResponse>(
    PROPERTIES_API.ROOT,
    { id, ...input },
  );

  return response.data.data;
};

type CreatePropertyOptionResponse = {
  status: string;
  code: number;
  message: string;
  data: PropertyOption;
};

export const createPropertyOption = async (
  input: CreatePropertyOptionInput,
) => {
  const response = await apiClient.post<CreatePropertyOptionResponse>(
    PROPERTIES_API.OPTIONS_ROOT,
    input,
  );

  return response.data.data;
};

type UpdatePropertyOptionResponse = {
  status: string;
  code: number;
  message: string;
  data: PropertyOption;
};

export const updatePropertyOption = async (
  input: UpdatePropertyOptionInput,
) => {
  const response = await apiClient.put<UpdatePropertyOptionResponse>(
    PROPERTIES_API.OPTIONS_ROOT,
    input,
  );

  return response.data.data;
};

export const updatePropertyOptionStatus = async (
  optionId: string,
  isActive: boolean,
) => {
  const response = await apiClient.patch(
    PROPERTIES_API.OPTION_STATUS(optionId),
    { is_active: isActive },
  );

  return response.data;
};

export const deletePropertyOption = async (optionId: string) => {
  const response = await apiClient.delete(
    PROPERTIES_API.OPTION(optionId),
  );

  return response.data;
};

export const getPropertyDetailErrorMessage = (error: unknown) => {
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

  return "Failed to load property detail.";
};

export const buildUpdatePayload = (form: {
  name: string;
  code: string;
  description: string;
}): UpdatePropertyInput => ({
  name: form.name.trim(),
  code: form.code.trim(),
  description: form.description.trim() || null,
});
