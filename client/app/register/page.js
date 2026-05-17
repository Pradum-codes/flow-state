"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password });
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
        <CardTitle>Register</CardTitle>
        <CardDescription className="mt-2">Create your FlowState account.</CardDescription>
        <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          {error ? <p className="text-xs text-red-300">{error}</p> : null}
          <Button disabled={loading}>{loading ? "Creating..." : "Register"}</Button>
        </form>
        <p className="mt-4 text-xs text-neutral-400">
          Already registered? <Link className="text-white underline" href="/login">Login</Link>
        </p>
      </Card>
    </main>
  );
}
