import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getApiBaseUrl } from "@/lib/api-url";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth-token";

import { LogoutButton } from "./logout-button";

type UserProfile = Record<string, unknown>;
type ApiResponse<T> = {
  data?: T;
  message: string;
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const getCurrentUser = async () => {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const response = await fetch(`${getApiBaseUrl()}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error("Failed to load current user.");
  }

  const responseData = (await response.json()) as ApiResponse<UserProfile>;

  if (!responseData.data) {
    throw new Error(responseData.message || "Current user data was not returned.");
  }

  return responseData.data;
};

export const DashboardPage = async () => {
  const user = await getCurrentUser();
  const entries = Object.entries(user);

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">Account</p>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Your current profile from the authenticated API.
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h2 className="text-base font-semibold">My Profile</h2>
          </div>
          <dl className="divide-y">
            {entries.length ? (
              entries.map(([key, value]) => (
                <div
                  className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[180px_1fr]"
                  key={key}
                >
                  <dt className="font-medium text-muted-foreground">{key}</dt>
                  <dd className="break-words">{formatValue(value)}</dd>
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
    </main>
  );
};
