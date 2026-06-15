import type { CreateWorkLogInput, WorkLog } from "@/modules/core/work-logs/models";

import type { WorkLogSheetFormState, WorkLogSheetMode } from "./models";

export const getDefaultWorkLogSheetForm = (): WorkLogSheetFormState => ({
  content: "",
  dateLogged: new Date(),
  moodScore: "3",
  productivityScore: "3",
  tags: [],
  title: "",
});

export const getWorkLogSheetTitle = (mode: WorkLogSheetMode) => {
  if (mode === "view") {
    return "View work log";
  }

  if (mode === "edit") {
    return "Edit work log";
  }

  return "Add work logs";
};

export const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");
  const timezoneOffset = -date.getTimezoneOffset();
  const timezoneSign = timezoneOffset >= 0 ? "+" : "-";
  const timezoneHours = Math.floor(Math.abs(timezoneOffset) / 60)
    .toString()
    .padStart(2, "0");
  const timezoneMinutes = (Math.abs(timezoneOffset) % 60)
    .toString()
    .padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds} ${timezoneSign}${timezoneHours}${timezoneMinutes}`;
};

export const formatDatePickerLabel = (date?: Date) =>
  date
    ? new Intl.DateTimeFormat("en-EN", {
        dateStyle: "medium",
      }).format(date)
    : "Select date";

export const getWorkLogSheetFormFromWorkLog = (
  workLog?: WorkLog
): WorkLogSheetFormState => {
  if (!workLog) {
    return getDefaultWorkLogSheetForm();
  }

  return {
    content: workLog.content,
    dateLogged: new Date(workLog.date_logged),
    moodScore: workLog.mood_score.toString(),
    productivityScore: workLog.productivity_score.toString(),
    tags: workLog.tags.map((tag) => tag.work_tag),
    title: workLog.title,
  };
};

export const buildWorkLogSheetPayload = (
  form: WorkLogSheetFormState
): CreateWorkLogInput => {
  if (!form.dateLogged) {
    throw new Error("Date logged is required.");
  }

  return {
    content: form.content.trim(),
    date_logged: formatDateForApi(form.dateLogged),
    mood_score: Number(form.moodScore),
    productivity_score: Number(form.productivityScore),
    tags: form.tags,
    title: form.title.trim(),
  };
};
