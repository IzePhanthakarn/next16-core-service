import type { Metadata } from "next";

import { PropertyDetailPage } from "@/modules/core/properties/detail";

export const metadata: Metadata = {
  title: "Property Details",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
  const { id } = await params;

  return <PropertyDetailPage propertyId={id} />;
}
