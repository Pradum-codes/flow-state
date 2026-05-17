"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
];

export function AppShell({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="fs-shell grid min-h-dvh md:grid-cols-[230px_1fr]">
      <aside className="border-r border-neutral-900 bg-black/40 p-4 md:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">FlowState</p>
        <p className="mt-2 text-sm text-white">{user?.name || user?.email}</p>
        <nav className="mt-8 grid gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
      <main className="p-5 md:p-8">{children}</main>
    </div>
  );
}
