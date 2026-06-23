import type { ProjectStatus } from "@/modules/core/projects/models";

export type SettingsGeneralForm = {
  title: string;
  description: string;
  status: ProjectStatus;
};
