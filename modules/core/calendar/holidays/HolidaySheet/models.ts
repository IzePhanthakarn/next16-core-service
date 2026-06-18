import type { ReactNode } from "react";

export type HolidaySheetFormState = {
  path: string;
};

export type HolidaySheetProps = {
  onSynced?: () => void;
  trigger: ReactNode;
};
