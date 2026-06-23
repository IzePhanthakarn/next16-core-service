import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/current-user";
import { ProjectSettingsPage } from "@/modules/core/projects/settings";

export const metadata: Metadata = {
  title: "Project Settings",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
  const { id } = await params;
  const user = await getCurrentUser();

  return <ProjectSettingsPage currentUserId={String(user.id ?? "")} projectId={id} />;
}
