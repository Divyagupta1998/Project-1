import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "PlanPilot AI",
  description: "AI-assisted product planning and project management"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
