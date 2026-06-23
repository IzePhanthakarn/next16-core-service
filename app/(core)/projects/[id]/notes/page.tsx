import type { Metadata } from "next";

import { ProjectNotesPage } from "@/modules/core/projects/notes";

export const metadata: Metadata = {
  title: "Project Notes",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
  const { id } = await params;

  return <ProjectNotesPage projectId={id} />;
}
