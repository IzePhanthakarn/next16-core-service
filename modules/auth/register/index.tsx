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

import { useRegisterForm } from "./functions";

export const RegisterPage = () => {
  const { errorMessage, form, onSubmit, resetForm, successMessage } =
    useRegisterForm();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = form;

  return (
    <form
      className="w-full max-w-sm rounded-lg border bg-background/95 p-6 shadow-sm backdrop-blur"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Create account</h1>
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
            <FieldError errors={[errors.first_name]} />
          </Field>

          <Field data-invalid={!!errors.last_name}>
            <FieldLabel htmlFor="last_name">Last name</FieldLabel>
            <Input
              id="last_name"
              placeholder="Doe"
              aria-invalid={!!errors.last_name}
              {...register("last_name")}
            />
            <FieldError errors={[errors.last_name]} />
          </Field>
        </div>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
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
            placeholder="At least 6 characters"
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

        {successMessage ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <Field orientation="horizontal" className="justify-end">
          <Button type="button" variant="outline" onClick={resetForm}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};
