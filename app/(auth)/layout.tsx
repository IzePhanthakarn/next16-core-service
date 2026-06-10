export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/auth_bg_persona.jpg')",
      }}
    >
      <div className="flex min-h-screen items-center justify-center bg-black/45 px-4 py-12">
        {children}
      </div>
    </main>
  );
}
