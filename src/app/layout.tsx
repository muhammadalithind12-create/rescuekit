import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taskly — rescued by RescueKit",
  description:
    "A team task board rescued from vibe-coded prototype to production-grade app: RLS, validation, error handling, and clean UX.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
