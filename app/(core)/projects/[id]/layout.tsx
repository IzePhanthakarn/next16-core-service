import { ProjectDetailLayout } from "@/modules/core/projects/detail/ProjectDetailLayout";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default async function Layout({ children, params }: Readonly<Props>) {
  const { id } = await params;

  return <ProjectDetailLayout projectId={id}>{children}</ProjectDetailLayout>;
}
