"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Menu, X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/projects", label: "Projects", icon: FolderKanban },
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <LayoutDashboard className="h-5 w-5 text-brand-600" />
          Profit Manager
        </div>
        <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="hidden h-14 items-center gap-2 border-b border-gray-200 px-6 font-semibold text-gray-900 lg:flex">
          <LayoutDashboard className="h-5 w-5 text-brand-600" />
          Profit Manager
        </div>
        <nav className="mt-14 space-y-1 px-3 py-4 lg:mt-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Spacer for mobile top bar */}
      <div className="h-14 lg:hidden" />
    </>
  );
}
