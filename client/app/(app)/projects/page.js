"use client";

import { useEffect, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { listProjects } from "@/services/projects";

export default function ProjectsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    listProjects(token)
      .then((res) => setItems(res?.items || []))
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <Card>
      <CardTitle>Projects</CardTitle>
      <CardDescription className="mt-3">
        Live data from backend `GET /projects`.
      </CardDescription>
      {error ? <CardDescription className="mt-3">Error: {error}</CardDescription> : null}
      <div className="mt-4 grid gap-2">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-300">No projects yet.</p>
        ) : (
          items.map((project) => (
            <div
              key={project.id}
              className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm"
            >
              {project.name}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
