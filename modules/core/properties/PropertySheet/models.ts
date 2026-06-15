import type { ReactNode } from "react";

export type PropertySheetFormState = {
  name: string;
  code: string;
  description: string;
};

export type PropertySheetProps = {
  onSaved?: () => void;
  trigger: ReactNode;
};
