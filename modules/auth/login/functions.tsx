"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";

import AUTH_API from "@/constants/api/auth";
import apiClient from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";
import { setAuthCookies, type AuthTokenResponse } from "@/lib/auth-token";
import { appToast } from "@/lib/toast";

import { loginSchema, type LoginFormValues } from "./models";

type ApiResponse<T> = {
  status: string;
  code: number;
  message: string;
  data?: T;
};

export const getLoginDefaultValues = (): LoginFormValues => ({
  email: "",
  password: "",
});

export const getLoginErrorMessage = (error: unknown) =>
  getApiErrorMessage(error, "Login failed. Please try again.");

export const useLoginForm = () => {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: getLoginDefaultValues(),
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    try {
      const response = await apiClient.post<ApiResponse<AuthTokenResponse>>(
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
