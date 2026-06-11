import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('/images/auth_bg_persona.jpg')",
      }}
    >
      <div className="fixed right-4 top-4 z-10">
        <ModeToggle className="border-white text-white" />
      </div>
      <div className="flex min-h-screen items-center justify-center bg-black/20 px-4 py-12">
        {children}
      </div>
      <Image
        className="absolute bottom-0 left-0 hidden h-auto md:block"
        src="/images/persona5_icon.gif"
        alt=""
        width={150}
        height={150}
        loading="eager"
      />{" "}
    </main>
  );
}
