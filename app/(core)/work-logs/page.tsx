export default function WorkLogsPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">Work Logs</p>
        <h1 className="text-2xl font-semibold">Work Logs</h1>
        <p className="text-sm text-muted-foreground">
          Track daily work activity and service notes.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        No work logs yet.
      </div>
    </section>
  );
}
