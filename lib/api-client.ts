import axios from "axios";

import { getApiBaseUrl } from "@/lib/api-url";

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});

export default apiClient;
