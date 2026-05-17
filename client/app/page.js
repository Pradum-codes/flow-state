import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="fs-shell grid place-items-center px-5 py-10 md:px-10">
      <section className="fs-panel w-full max-w-4xl p-7 md:p-12">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">FlowState</p>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
          Developer-Centric Execution Workspace
        </h1>
        <p className="fs-muted mt-5 max-w-2xl text-sm leading-relaxed">
          Plan projects, execute tasks, and keep momentum in one focused system.
          Sign in to access your backend-connected dashboard.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="ghost">Create Account</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
