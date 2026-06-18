import type { CalendarEvent, CalendarEventTag } from "../models";

export type EventSheetMode = "create" | "view" | "edit";

export type EventSheetFormState = {
  title: string;
  description: string;
  startDate?: Date;
  startTime: string;
  endDate?: Date;
  endTime: string;
  tag: CalendarEventTag | "";
};

export type EventSheetProps = {
  event?: CalendarEvent;
  mode: EventSheetMode;
  onSaved?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

export type CreateEventPayload = {
  description: string | null;
  end_date: string;
  start_date: string;
  tag: string;
  title: string;
  user_id?: string;
};
