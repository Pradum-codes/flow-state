"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

async function api(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Request failed");
  }

  return payload?.data ?? payload;
}

export function ApiPlayground() {
  const [email, setEmail] = useState("demo@flowstate.dev");
  const [password, setPassword] = useState("password123");
  const [projectName, setProjectName] = useState("FlowState Demo Project");
  const [taskTitle, setTaskTitle] = useState("Implement frontend phase 2");
  const [token, setToken] = useState("");
  const [projectId, setProjectId] = useState("");
  const [output, setOutput] = useState("Run actions to see backend responses here.");
  const [loading, setLoading] = useState(false);

  const canCreateTask = useMemo(() => token && projectId, [token, projectId]);

  async function run(label, fn) {
    setLoading(true);
    try {
      const result = await fn();
      setOutput(`${label}:\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setOutput(`${label} failed:\n${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardTitle>Backend API Playground</CardTitle>
      <CardDescription className="mt-3">
        This panel calls your live backend Phase 1 APIs from the browser.
      </CardDescription>

      <div className="mt-5 grid gap-3">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              run("Register", () =>
                api("/auth/register", {
                  method: "POST",
                  body: { email, password, name: "Flow User" },
                }).then((res) => {
                  setToken(res.token || "");
                  return res;
                })
              )
            }
            disabled={loading}
          >
            Register
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              run("Login", () =>
                api("/auth/login", {
                  method: "POST",
                  body: { email, password },
                }).then((res) => {
                  setToken(res.token || "");
                  return res;
                })
              )
            }
            disabled={loading}
          >
            Login
          </Button>
          <Button
            variant="ghost"
            onClick={() => run("Get Me", () => api("/auth/me", { token }))}
            disabled={loading || !token}
          >
            Get Me
          </Button>
        </div>

        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              run("Create Project", () =>
                api("/projects", {
                  method: "POST",
                  token,
                  body: { name: projectName, status: "ACTIVE" },
                }).then((res) => {
                  setProjectId(res.id || "");
                  return res;
                })
              )
            }
            disabled={loading || !token}
          >
            Create Project
          </Button>
          <Button
            variant="ghost"
            onClick={() => run("List Projects", () => api("/projects", { token }))}
            disabled={loading || !token}
          >
            List Projects
          </Button>
        </div>

        <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task title" />
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              run("Create Task", () =>
                api(`/projects/${projectId}/tasks`, {
                  method: "POST",
                  token,
                  body: { title: taskTitle, priority: "HIGH", status: "TODO" },
                })
              )
            }
            disabled={loading || !canCreateTask}
          >
            Create Task
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              run("List Tasks", () => api(`/projects/${projectId}/tasks`, { token }))
            }
            disabled={loading || !canCreateTask}
          >
            List Tasks
          </Button>
        </div>
      </div>

      <pre className="mt-5 max-h-80 overflow-auto rounded-xl border border-neutral-800 bg-black p-3 text-xs leading-relaxed text-neutral-200">
        {output}
      </pre>
    </Card>
  );
}
