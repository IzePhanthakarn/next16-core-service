import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export { LoginPage as default } from "@/modules/auth/login";
