import { z } from "zod";

export const registerSchema = z
  .object({
    first_name: z.string().min(2, "First name must be at least 2 characters."),
    last_name: z.string().min(2, "Last name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirm_password: z
      .string()
      .min(6, "Confirm password must be at least 6 characters."),
    secret_word: z
      .string()
      .min(6, "Secret word must be at least 6 characters."),
  })
  .refine((values) => values.password === values.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
