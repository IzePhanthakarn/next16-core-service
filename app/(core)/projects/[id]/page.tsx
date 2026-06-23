import { redirect } from "next/navigation";

import PAGE_ROUTE from "@/constants/page_route";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
  const { id } = await params;

  redirect(PAGE_ROUTE.PROJECTS.KANBAN(id));
}
