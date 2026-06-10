"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { registerSchema, type RegisterFormValues } from "./models";

const registerUrl = "http://localhost:8080/auth/register";

export const getRegisterDefaultValues = (): RegisterFormValues => ({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
  secret_word: "",
});

export const getRegisterErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
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

  return "Register failed. Please try again.";
};

export const useRegisterForm = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: getRegisterDefaultValues(),
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        secret_word: values.secret_word,
      };

      await axios.post(registerUrl, payload);
      setSuccessMessage("Register success.");
      form.reset(getRegisterDefaultValues());
    } catch (error) {
      setErrorMessage(getRegisterErrorMessage(error));
    }
  };

  const resetForm = () => {
    setSuccessMessage("");
    setErrorMessage("");
    form.reset(getRegisterDefaultValues());
  };

  return {
    errorMessage,
    form,
    onSubmit,
    resetForm,
    successMessage,
  };
};
