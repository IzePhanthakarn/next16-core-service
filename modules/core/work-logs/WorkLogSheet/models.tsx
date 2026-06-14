import type { WorkLog } from "@/modules/core/work-logs/models";

export type WorkLogSheetMode = "create" | "view" | "edit";

export type WorkLogSheetFormState = {
  content: string;
  dateLogged?: Date;
  moodScore: string;
  productivityScore: string;
  tags: string;
  title: string;
};

export type WorkLogSheetProps = {
  mode: WorkLogSheetMode;
  onSaved?: () => void;
  trigger: React.ReactNode;
  workLog?: WorkLog;
};
