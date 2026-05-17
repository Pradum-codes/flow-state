"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { listProjects } from "@/services/projects";

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    listProjects(token)
      .then((res) => setProjectCount(res?.items?.length || 0))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="grid gap-6">
      <section className="fs-panel p-6 md:p-8">
        <Badge>Workspace</Badge>
        <h1 className="mt-4 text-2xl md:text-3xl">Welcome back, {user?.name || "Builder"}</h1>
        <p className="fs-muted mt-3 text-sm">Your backend-connected application shell is active.</p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardTitle>Projects Snapshot</CardTitle>
          {loading ? (
            <Skeleton className="mt-4 h-8 w-20" />
          ) : (
            <CardDescription className="mt-4 text-white">
              Total projects in backend: {projectCount}
            </CardDescription>
          )}
          {error ? <CardDescription className="mt-2">Error: {error}</CardDescription> : null}
        </Card>
        <Card>
          <CardTitle>Next</CardTitle>
          <CardDescription className="mt-4">
            Phase 3 UI will extend this shell into full project and task management screens.
          </CardDescription>
        </Card>
      </section>
    </div>
  );
}
