import { CoreLayout } from "@/components/core/core-layout";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CoreLayout>{children}</CoreLayout>;
}
