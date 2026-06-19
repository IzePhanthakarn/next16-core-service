import type { Metadata } from "next";

import {
  formatUserValue,
  getCurrentUser,
  getUserDisplayName,
} from "@/lib/current-user";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const entries = Object.entries(user);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">Profile</p>
        <h1 className="text-2xl font-semibold">{getUserDisplayName(user)}</h1>
        <p className="text-sm text-muted-foreground">
          Your account details from the authenticated API.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h2 className="text-base font-semibold">User Details</h2>
        </div>
        <dl className="divide-y">
          {entries.length ? (
            entries.map(([key, value]) => (
              <div
                className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[180px_1fr]"
                key={key}
              >
                <dt className="font-medium text-muted-foreground">{key}</dt>
                <dd className="break-words">{formatUserValue(value)}</dd>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No user data returned.
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}
