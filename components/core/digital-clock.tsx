"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import PAGE_ROUTE from "@/constants/page_route";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const pad = (value: number) => value.toString().padStart(2, "0");

const formatDate = (date: Date) =>
  `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;

const formatTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

interface DigitalClockProps {
  className?: string;
}

export const DigitalClock = ({ className }: Readonly<DigitalClockProps>) => {
  const [now, setNow] = useState<Date | null>(null);
  const router = useRouter()
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      className={cn(
        "flex flex-col items-start px-3 py-1 duration-200 rounded cursor-pointer hover:bg-accent active:scale-95",
        className
      )}
      type="button"
      onClick={()=> router.push(PAGE_ROUTE.CALENDAR.INDEX)}
      suppressHydrationWarning
    >
      <span className="text-sm font-medium text-muted-foreground">
        {now ? formatDate(now) : " "}
      </span>
      <span className="font-mono text-base font-semibold leading-tight tabular-nums tracking-wide text-foreground">
        {now ? formatTime(now) : "--:--"}
      </span>
    </button>
  );
};
