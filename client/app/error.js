"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="fs-shell grid place-items-center px-4 py-12">
      <section className="fs-panel w-full max-w-xl p-6">
        <h1 className="text-xl text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-neutral-300">
          The app hit an unexpected error. You can retry or go back to dashboard.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={reset}>Try again</Button>
          <Link href="/dashboard">
            <Button variant="ghost">Go to dashboard</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
