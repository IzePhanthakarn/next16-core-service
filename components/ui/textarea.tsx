import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-foreground/20 bg-white/40 px-2.5 py-2 text-base shadow-inner shadow-black/5 transition-colors outline-none placeholder:text-muted-foreground/80 hover:border-foreground/50 focus-visible:border-foreground focus-visible:ring-3 focus-visible:ring-foreground/20 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-primary aria-invalid:ring-3 aria-invalid:ring-red-950/30 md:text-sm dark:border-white/25 dark:bg-input/30 dark:shadow-none dark:hover:border-white/60 dark:focus-visible:border-white dark:focus-visible:ring-white/20 dark:disabled:bg-input/80 dark:aria-invalid:border-primary dark:aria-invalid:ring-red-950/60",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
