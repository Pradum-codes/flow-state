"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/habits", label: "Habits" },
  { href: "/reminders", label: "Reminders" },
  { href: "/notes", label: "Notes" },
];

export function AppShell({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="fs-shell grid min-h-dvh md:grid-cols-[230px_1fr]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-black"
      >
        Skip to main content
      </a>
      <aside
        id="primary-nav"
        className={cn(
          "border-r border-neutral-900 bg-black/40 p-4 md:p-5",
          mobileNavOpen ? "block" : "hidden md:block"
        )}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">FlowState</p>
        <p className="mt-2 text-sm text-white">{user?.name || user?.email}</p>
        <nav className="mt-8 grid gap-2" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs uppercase tracking-[0.14em] transition",
                pathname === item.href
                  ? "border-white bg-white text-black"
                  : "border-neutral-800 text-neutral-200 hover:bg-neutral-950"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button className="mt-8 w-full" variant="ghost" onClick={logout}>
          Logout
        </Button>
      </aside>
      <main id="main-content" className="p-5 md:p-8">
        <div className="mb-4 md:hidden">
          <Button
            variant="ghost"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-expanded={mobileNavOpen}
            aria-controls="primary-nav"
          >
            {mobileNavOpen ? "Close Menu" : "Open Menu"}
          </Button>
        </div>
        {children}
      </main>
    </div>
  );
}
