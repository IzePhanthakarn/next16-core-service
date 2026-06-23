import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/current-user";
import { ProjectBacklogsPage } from "@/modules/core/projects/backlogs";

export const metadata: Metadata = {
  title: "Project Backlogs",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
  const { id } = await params;
  const user = await getCurrentUser();

  return <ProjectBacklogsPage currentUserId={String(user.id ?? "")} projectId={id} />;
}
