"use client";

import type { CSSProperties } from "react";
import { toast } from "sonner";

type ToastStyle = CSSProperties & Record<"--normal-bg" | "--normal-text" | "--normal-border", string>;

const toastStyles = {
  success: {
    "--normal-bg":
      "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
    "--normal-text":
      "light-dark(var(--color-green-600), var(--color-green-400))",
    "--normal-border":
      "light-dark(var(--color-green-600), var(--color-green-400))",
  },
  warning: {
    "--normal-bg":
      "color-mix(in oklab, light-dark(var(--color-amber-600), var(--color-amber-400)) 10%, var(--background))",
    "--normal-text":
      "light-dark(var(--color-amber-600), var(--color-amber-400))",
    "--normal-border":
      "light-dark(var(--color-amber-600), var(--color-amber-400))",
  },
  info: {
    "--normal-bg":
      "color-mix(in oklab, light-dark(var(--color-sky-600), var(--color-sky-400)) 10%, var(--background))",
    "--normal-text":
      "light-dark(var(--color-sky-600), var(--color-sky-400))",
    "--normal-border":
      "light-dark(var(--color-sky-600), var(--color-sky-400))",
  },
  error: {
    "--normal-bg":
      "color-mix(in oklab, var(--destructive) 10%, var(--background))",
    "--normal-text": "var(--destructive)",
    "--normal-border": "var(--destructive)",
  },
} satisfies Record<string, ToastStyle>;

const defaultOptions = {
  position: "top-right",
} as const;

export const appToast = {
  success: (message: string) =>
    toast.success(message, {
      ...defaultOptions,
      style: toastStyles.success,
    }),
  warning: (message: string) =>
    toast.warning(message, {
      ...defaultOptions,
      style: toastStyles.warning,
    }),
  info: (message: string) =>
    toast.info(message, {
      ...defaultOptions,
      style: toastStyles.info,
    }),
  error: (message: string) =>
    toast.error(message, {
      ...defaultOptions,
      style: toastStyles.error,
    }),
};
