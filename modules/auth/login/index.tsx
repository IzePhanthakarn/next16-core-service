"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useLoginForm } from "./functions";

export const LoginPage = () => {
  const { form, onSubmit } = useLoginForm();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = form;

  return (
    <form
      className="w-full max-w-xl rounded-lg border bg-background/75 p-6 shadow-2xl backdrop-blur"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup className="-space-y-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            Sign in to{" "}
            <span className="font-bold text-primary">Ize Core Service</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your account details to continue.
          </p>
        </div>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            placeholder="john@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldDescription>
            Use the email connected to your account.
          </FieldDescription>
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        <div className="flex flex-col items-center gap-3 pt-5">
          <Button
            className="h-12 w-full max-w-xs rounded-sm bg-gradient-to-tr from-red-600 to-pink-500 px-8 text-sm font-semibold tracking-[0.25em] text-white shadow-md shadow-pink-500/20 hover:from-red-500 hover:to-pink-400"
            size="lg"
            type="submit"
            isLoading={isSubmitting}
          >
            SIGN IN
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              className="font-medium text-primary underline-offset-4 hover:underline"
              href="/register"
            >
              Create account
            </Link>
          </p>
        </div>
      </FieldGroup>
    </form>
  );
};
