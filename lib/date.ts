export const formatMediumDate = (value: string | Date) =>
  new Intl.DateTimeFormat("en-EN", { dateStyle: "medium" }).format(
    typeof value === "string" ? new Date(value) : value,
  );

export const formatDatePickerLabel = (date?: Date) =>
  date ? formatMediumDate(date) : "Select date";
