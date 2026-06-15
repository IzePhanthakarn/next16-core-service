"use client";

import { IconamoonLightning1 } from "@/assets/icons/IconamoonLightning1";
import { UilCalendarAlt } from "@/assets/icons/UilCalendarAlt";
import { UilClipboardNotes } from "@/assets/icons/UilClipboardNotes";
import { UilSmileBeam } from "@/assets/icons/UilSmileBeam";
import { CircularProgress } from "@/components/ui/circular-progrss";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  moodScoreOptions,
  productivityScoreOptions,
} from "@/constants/worklogs";
import { cn } from "@/lib/utils";

import {
  formatScore,
  getScoreLabel,
  getScoreProgressValue,
  getStatsProgressColor,
  getStatsProgressValue,
} from "./functions";
import { defaultActiveDaysTarget, type StatsGridProps } from "./models";

export const StatsGrid = ({
  activeDays,
  activeDaysTarget = defaultActiveDaysTarget,
  allWorkLogs,
  monthlyMoodScore,
  monthlyProductivityScore,
}: StatsGridProps) => {
  const activeDaysValue = getStatsProgressValue(activeDays, activeDaysTarget);
  const monthlyMoodValue = getScoreProgressValue(monthlyMoodScore);
  const monthlyProductivityValue = getScoreProgressValue(
    monthlyProductivityScore,
  );
  const monthlyMoodLabel = getScoreLabel(monthlyMoodScore, moodScoreOptions);
  const monthlyProductivityLabel = getScoreLabel(
    monthlyProductivityScore,
    productivityScoreOptions,
  );
  const activeDaysColor = getStatsProgressColor(activeDaysValue);
  const monthlyMoodColor = getStatsProgressColor(monthlyMoodValue);
  const monthlyProductivityColor = getStatsProgressColor(
    monthlyProductivityValue,
  );

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="flex flex-col justify-between gap-2 rounded-lg border bg-card p-2 md:col-span-2">
        <div className="flex items-center gap-3">
          <div className="flex w-full gap-3">
            <UilClipboardNotes className="h-10 w-10 text-primary" />
            <div className="flex flex-col">
              <p className="text-sm font-medium text-muted-foreground">
                All Work Logs
              </p>
              <p className="text-lg font-semibold">{allWorkLogs} items</p>
            </div>
          </div>
          <Separator orientation="vertical" />
          <div className="flex w-full items-center gap-3">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-muted-foreground">
                Monthly Work Logs
              </p>
              <p className="text-lg font-semibold">{activeDays} item{activeDays > 1 && "s"}</p>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-3">
          <UilSmileBeam
            className={cn("h-10 w-10", monthlyMoodColor.textClassName)}
          />
          <div className="flex w-full flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              Monthly Mood
            </p>
            <Progress
              aria-label="Monthly mood progress"
              className={cn("h-2 w-full", monthlyMoodColor.progressClassName)}
              value={monthlyMoodValue}
            />
            <div className="flex items-center justify-between text-xs font-medium uppercase text-muted-foreground">
              <div className="flex items-center gap-1.5">{monthlyMoodLabel}</div>
              <span>{formatScore(monthlyMoodScore)}</span>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-3">
          <IconamoonLightning1
            className={cn(
              "h-10 w-10",
              monthlyProductivityColor.textClassName,
            )}
          />
          <div className="flex w-full flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              Monthly Productivity
            </p>
            <Progress
              aria-label="Monthly productivity progress"
              className={cn(
                "h-2 w-full",
                monthlyProductivityColor.progressClassName,
              )}
              value={monthlyProductivityValue}
            />
            <div className="flex items-center justify-between text-xs font-medium uppercase text-muted-foreground">
              <div className="flex items-center gap-1.5">
                {monthlyProductivityLabel}
              </div>
              <span>{formatScore(monthlyProductivityScore)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-lg border bg-card p-4 md:col-span-2">
        <CircularProgress
          circleStrokeWidth={5}
          progressBgClassName="text-primary/10"
          progressClassName={cn(
            " duration-1000",
            activeDaysColor.textClassName,
          )}
          progressStrokeWidth={9}
          renderLabel={() => (
            <div className="flex flex-col items-center">
              <UilCalendarAlt
                className={cn(
                  "mb-0.5 h-10 w-10  duration-1000",
                  activeDaysColor.textClassName,
                )}
              />
              <div className="flex items-baseline">
                <span
                  className={cn(
                    "text-2xl font-medium tabular-nums",
                    activeDaysColor.textClassName,
                  )}
                >
                  {activeDays}
                </span>
                <span
                  className={cn(
                    "ml-0.5 text-lg font-medium",
                    activeDaysColor.textClassName,
                  )}
                >
                  /{activeDaysTarget}
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Days
              </p>
            </div>
          )}
          shape="round"
          showLabel
          size={160}
          trackDashArray="8 15"
          value={activeDaysValue}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-medium text-muted-foreground">
                Active Days
              </p>
              <p className="text-2xl font-semibold">
                {activeDays}/{activeDaysTarget} Days
              </p>
            </div>
            <span
              className={cn(
                "text-lg font-semibold",
                activeDaysColor.textClassName,
              )}
            >
              {activeDaysValue}%
            </span>
          </div>
          <Progress
            aria-label="Active days progress"
            className={cn("h-2 w-full", activeDaysColor.progressClassName)}
            value={activeDaysValue}
          />
          <div className="flex items-center justify-between text-sm font-medium uppercase text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <UilCalendarAlt className="h-4 w-4" />
              Progress
            </div>
            <span>Target: {activeDaysTarget} Days</span>
          </div>
        </div>
      </div>
    </div>
  );
};
