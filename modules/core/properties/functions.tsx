import PROPERTIES_API from "@/constants/api/properties";
import apiClient from "@/lib/api-client";

import {
  type CreatePropertyInput,
  type PropertiesQuery,
  type PropertiesResponse,
  type Property,
} from "./models";

export { formatMediumDate as formatPropertyDate } from "@/lib/date";

type PropertyResponse = {
  status: string;
  code: number;
  message: string;
  data: Property;
};

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
