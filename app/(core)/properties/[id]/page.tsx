import { PropertyDetailPage } from "@/modules/core/properties/detail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
  const { id } = await params;

  return <PropertyDetailPage propertyId={id} />;
}
