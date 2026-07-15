import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      autoComplete="off"
      className={cn(
        "h-9 w-full min-w-0 rounded-sm border border-foreground/20 bg-white/40 px-2.5 py-1 text-base shadow-inner shadow-black/5 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/80 hover:border-foreground/50 focus-visible:border-foreground focus-visible:ring-3 focus-visible:ring-foreground/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-primary aria-invalid:ring-3 aria-invalid:ring-red-950/30 md:text-sm dark:border-white/25 dark:bg-input/30 dark:shadow-none dark:hover:border-white/60 dark:focus-visible:border-white dark:focus-visible:ring-white/20 dark:disabled:bg-input/80 dark:aria-invalid:border-primary dark:aria-invalid:ring-red-950/60",
        className
      )}
      {...props}
    />
  )
}

export { Input }
