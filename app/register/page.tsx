"use client";

import axios, { AxiosError } from "axios";
import { FormEvent, useState } from "react";

type RegisterPayload = {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  secret_word: string;
};

const initialForm: RegisterPayload = {
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  secret_word: "",
};

const registerUrl = "http://localhost:8080/auth/register";

function getErrorMessage(error: unknown) {
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
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterPayload>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(name: keyof RegisterPayload, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await axios.post(registerUrl, form);
      setSuccessMessage("Register success.");
      setForm(initialForm);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-zinc-500">Auth</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Create account
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Email</span>
            <input
              className="mt-1 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              name="email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="user1@mail.com"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                First name
              </span>
              <input
                className="mt-1 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                name="first_name"
                type="text"
                value={form.first_name}
                onChange={(event) =>
                  updateField("first_name", event.target.value)
                }
                placeholder="User1"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                Last name
              </span>
              <input
                className="mt-1 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                name="last_name"
                type="text"
                value={form.last_name}
                onChange={(event) =>
                  updateField("last_name", event.target.value)
                }
                placeholder="Core"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Password</span>
            <input
              className="mt-1 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              name="password"
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="P@ssw0rd1234"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-700">
              Secret word
            </span>
            <input
              className="mt-1 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              name="secret_word"
              type="text"
              value={form.secret_word}
              onChange={(event) =>
                updateField("secret_word", event.target.value)
              }
              placeholder="Ize1706"
              required
            />
          </label>

          {successMessage ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            className="h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
      </section>
    </main>
  );
}
