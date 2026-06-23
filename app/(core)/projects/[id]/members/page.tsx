import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/current-user";
import { ProjectMembersPage } from "@/modules/core/projects/members";

export const metadata: Metadata = {
  title: "Project Members",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
  const { id } = await params;
  const user = await getCurrentUser();

  return <ProjectMembersPage currentUserId={String(user.id ?? "")} projectId={id} />;
}
