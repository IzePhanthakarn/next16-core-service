import type { CreatePropertyInput } from "@/modules/core/properties/models";

import type { PropertySheetFormState } from "./models";

export const getDefaultPropertySheetForm = (): PropertySheetFormState => ({
  name: "",
  code: "",
  description: "",
});

export const generatePropertyCode = (name: string) =>
  name
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

export const buildPropertySheetPayload = (
  form: PropertySheetFormState,
): CreatePropertyInput => ({
  name: form.name.trim(),
  code: form.code.trim(),
  description: form.description.trim() || null,
});
