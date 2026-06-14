"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError, isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";

import AUTH_API from "@/constants/api/auth";
import apiClient from "@/lib/api-client";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-token";
import { appToast } from "@/lib/toast";

import { loginSchema, type LoginFormValues } from "./models";

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

type ApiResponse<T> = {
  status: string;
  code: number;
  message: string;
  data?: T;
};

type ErrorResponse = {
  error?: string;
  message?: string;
};

export const getLoginDefaultValues = (): LoginFormValues => ({
  email: "",
  password: "",
});

const setCookie = (name: string, value: string, maxAge: number) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
};

const setAuthCookies = (data: AuthResponse) => {
  setCookie(ACCESS_TOKEN_COOKIE_NAME, data.access_token, data.expires_in);
  setCookie(
    REFRESH_TOKEN_COOKIE_NAME,
    data.refresh_token,
    60 * 60 * 24 * 7
  );
};

export const getLoginErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const responseError = error as ErrorResponse;

    return responseError.message || responseError.error || "Login failed. Please try again.";
  }

  return "Login failed. Please try again.";
};

export const useLoginForm = () => {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: getLoginDefaultValues(),
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        AUTH_API.LOGIN,
        {
          email: values.email,
          password: values.password,
        }
      );

      if (!response.data.data?.access_token || !response.data.data.refresh_token) {
        throw new Error("Login success, but tokens were not returned.");
      }

      setAuthCookies(response.data.data);

      form.reset(getLoginDefaultValues());
      appToast.success("Login success.");
      router.replace("/dashboard");
    } catch (error) {
      appToast.error(getLoginErrorMessage(error));
    }
  };

  return {
    form,
    onSubmit,
  };
};
