"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { useRegisterForm } from "./functions";

export const RegisterPage = () => {
  const { form, onSubmit } = useRegisterForm();
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
          <h1 className="text-2xl font-semibold">Create account for <span className="text-primary font-bold">Ize Core Service</span></h1>
          <p className="text-sm text-muted-foreground">
            Fill in your details to register.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.first_name}>
            <FieldLabel htmlFor="first_name">First name</FieldLabel>
            <Input
              id="first_name"
              placeholder="John"
              aria-invalid={!!errors.first_name}
              {...register("first_name")}
            />
            <FieldError
              className="text-xs sm:whitespace-nowrap sm:text-sm"
              errors={[errors.first_name]}
            />
          </Field>

          <Field data-invalid={!!errors.last_name}>
            <FieldLabel htmlFor="last_name">Last name</FieldLabel>
            <Input
              id="last_name"
              placeholder="Doe"
              aria-invalid={!!errors.last_name}
              {...register("last_name")}
            />
            <FieldError
              className="text-xs sm:whitespace-nowrap sm:text-sm"
              errors={[errors.last_name]}
            />
          </Field>
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
            We&apos;ll use this email for your account access.
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

        <Field data-invalid={!!errors.confirm_password}>
          <FieldLabel htmlFor="confirm_password">Confirm password</FieldLabel>
          <Input
            id="confirm_password"
            type="password"
            placeholder="Repeat your password"
            aria-invalid={!!errors.confirm_password}
            {...register("confirm_password")}
          />
          <FieldError errors={[errors.confirm_password]} />
        </Field>

        <Field data-invalid={!!errors.secret_word}>
          <FieldLabel htmlFor="secret_word">Secret word</FieldLabel>
          <Input
            id="secret_word"
            type="password"
            placeholder="At least 6 characters"
            aria-invalid={!!errors.secret_word}
            {...register("secret_word")}
          />
          <FieldDescription>
            Keep this word private for account recovery.
          </FieldDescription>
          <FieldError errors={[errors.secret_word]} />
        </Field>

        <div className="flex flex-col items-center gap-3 pt-5">
          <Button
            className="h-12 w-full max-w-xs rounded-sm bg-gradient-to-tr from-red-600 to-pink-500 px-8 text-sm font-semibold tracking-[0.25em] text-white shadow-md shadow-pink-500/20 hover:from-red-500 hover:to-pink-400"
            size="lg"
            type="submit"
            isLoading={isSubmitting}
          >
            CREATE ACCOUNT
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              className="font-medium text-primary underline-offset-4 hover:underline"
              href="/login"
            >
              Sign in
            </Link>
          </p>
        </div>
      </FieldGroup>
    </form>
  );
};
