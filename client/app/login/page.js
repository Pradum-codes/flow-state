"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="fs-shell grid place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardTitle>Login</CardTitle>
        <CardDescription className="mt-2">Access your FlowState workspace.</CardDescription>
        <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? <p className="text-xs text-red-300">{error}</p> : null}
          <Button disabled={loading}>{loading ? "Signing In..." : "Login"}</Button>
        </form>
        <p className="mt-4 text-xs text-neutral-400">
          Need an account? <Link className="text-white underline" href="/register">Register</Link>
        </p>
      </Card>
    </main>
  );
}
