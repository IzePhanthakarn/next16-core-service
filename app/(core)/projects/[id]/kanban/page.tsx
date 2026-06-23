import type { Metadata } from "next";

import { KanbanBoard } from "@/modules/core/projects/kanban";

export const metadata: Metadata = {
  title: "Project Kanban",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
  const { id } = await params;

  return <KanbanBoard projectId={id} />;
}
