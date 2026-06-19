import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Holidays",
};

export {HolidaysPage as default} from "@/modules/core/calendar/holidays";