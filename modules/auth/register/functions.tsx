"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";

import AUTH_API from "@/constants/api/auth";
import apiClient from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";
import { appToast } from "@/lib/toast";

import { registerSchema, type RegisterFormValues } from "./models";

export const getRegisterDefaultValues = (): RegisterFormValues => ({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
  secret_word: "",
});

export const getRegisterErrorMessage = (error: unknown) =>
  getApiErrorMessage(error, "Register failed. Please try again.");

export const useRegisterForm = () => {
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: getRegisterDefaultValues(),
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    try {
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        secret_word: values.secret_word,
      };

      await apiClient.post(AUTH_API.REGISTER, payload);
      form.reset(getRegisterDefaultValues());
      appToast.success("Register success.");
      router.push("/login");
    } catch (error) {
      appToast.error(getRegisterErrorMessage(error));
    }
  };

  const resetForm = () => {
    form.reset(getRegisterDefaultValues());
  };

  return {
    form,
    onSubmit,
    resetForm,
  };
};
