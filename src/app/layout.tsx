import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/ui/Sidebar";
import ToastProvider from "@/components/ui/ToastProvider";

export const metadata: Metadata = {
  title: "Project Maintenance & Profit Manager",
  description: "Manage construction project expenses, salaries, and profit.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 lg:pl-64">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
        <ToastProvider />
      </body>
    </html>
  );
}
