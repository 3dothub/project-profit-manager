"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const id = params?.id as string;

  const tabs = [
    { href: `/projects/${id}`, label: "Dashboard" },
    { href: `/projects/${id}/expenses`, label: "Expenses" },
    { href: `/projects/${id}/employees`, label: "Employees" },
    { href: `/projects/${id}/attendance`, label: "Attendance" },
  ];

  return (
    <div>
      <Link href="/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const active = tab.href === `/projects/${id}` ? pathname === tab.href : pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  "whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium",
                  active ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}
