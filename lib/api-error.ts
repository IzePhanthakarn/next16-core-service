import { isAxiosError } from "axios";

export const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
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

  return fallbackMessage;
};
