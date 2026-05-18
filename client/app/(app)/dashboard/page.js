"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import { getGitHubActivity, getGitHubStatus, getGitHubSummary, connectGitHub, disconnectGitHub, syncGitHub } from "@/services/github";
import { listHabits, listNotes, listReminders } from "@/services/productivity";
import { listProjects, listProjectTasks } from "@/services/projects";

function daysAgoIso(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [gitHubStatus, setGitHubStatus] = useState({ connected: false, username: null, lastSyncedAt: null });
  const [gitHubSummary, setGitHubSummary] = useState({ totalEvents: 0, byType: [], topRepos: [], lastActivityAt: null });
  const [gitHubActivity, setGitHubActivity] = useState([]);
  const [gitHubUsernameInput, setGitHubUsernameInput] = useState("");
  const [snapshotNowMs, setSnapshotNowMs] = useState(0);

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setSnapshotNowMs(Date.now());
      const [projectsRes, habitsRes, remindersRes, notesRes, statusRes] = await Promise.all([
        listProjects(token),
        listHabits(token),
        listReminders(token),
        listNotes(token),
        getGitHubStatus(token),
      ]);

      const projectItems = projectsRes?.items || [];
      setProjects(projectItems);
      setHabits(habitsRes || []);
      setReminders(remindersRes || []);
      setNotes(notesRes || []);
      setGitHubStatus(statusRes || { connected: false });
      setGitHubUsernameInput(statusRes?.username || "");

      const taskResponses = await Promise.all(
        projectItems.slice(0, 10).map((project) => listProjectTasks(token, project.id))
      );
      const allTasks = taskResponses.flatMap((res) => res?.items || []);
      setTasks(allTasks);

      if (statusRes?.connected) {
        const [summaryRes, activityRes] = await Promise.all([
          getGitHubSummary(token, `from=${encodeURIComponent(daysAgoIso(30))}`),
          getGitHubActivity(token, "limit=8"),
        ]);
        setGitHubSummary(summaryRes || {});
        setGitHubActivity(activityRes?.items || []);
      } else {
        setGitHubSummary({ totalEvents: 0, byType: [], topRepos: [], lastActivityAt: null });
        setGitHubActivity([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, [loadDashboard]);

  const metrics = useMemo(() => {
    const done = tasks.filter((task) => task.status === "DONE").length;
    const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS").length;
    const pendingReminders = reminders.filter((r) => !r.isCompleted).length;
    const overdueReminders = reminders.filter(
      (r) => !r.isCompleted && new Date(r.dueAt).getTime() < snapshotNowMs
    ).length;
    return {
      projects: projects.length,
      tasks: tasks.length,
      completedTasks: done,
      inProgressTasks: inProgress,
      habits: habits.length,
      pendingReminders,
      overdueReminders,
      notes: notes.length,
    };
  }, [projects, tasks, habits, reminders, notes, snapshotNowMs]);

  async function onConnectGitHub() {
    if (!token || !gitHubUsernameInput.trim()) return;
    try {
      await connectGitHub(token, { username: gitHubUsernameInput.trim() });
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDisconnectGitHub() {
    if (!token) return;
    try {
      await disconnectGitHub(token);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onSyncGitHub() {
    if (!token) return;
    try {
      await syncGitHub(token);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="fs-panel p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Dashboard</Badge>
          <Badge>Phase 5</Badge>
        </div>
        <h1 className="mt-4 text-2xl md:text-3xl">Welcome back, {user?.name || "Builder"}</h1>
        <p className="fs-muted mt-3 text-sm">
          Unified snapshot across projects, tasks, routines, reminders, and GitHub activity.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardTitle>Projects</CardTitle><CardDescription className="mt-2 text-white">{loading ? "..." : metrics.projects}</CardDescription></Card>
        <Card><CardTitle>Tasks Done</CardTitle><CardDescription className="mt-2 text-white">{loading ? "..." : `${metrics.completedTasks}/${metrics.tasks}`}</CardDescription></Card>
        <Card><CardTitle>Habits</CardTitle><CardDescription className="mt-2 text-white">{loading ? "..." : metrics.habits}</CardDescription></Card>
        <Card><CardTitle>Overdue</CardTitle><CardDescription className="mt-2 text-white">{loading ? "..." : metrics.overdueReminders}</CardDescription></Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle>Execution Split</CardTitle>
          <CardDescription className="mt-2">Task status distribution.</CardDescription>
          <div className="mt-4 grid gap-2">
            {[
              { label: "TODO", count: tasks.filter((t) => t.status === "TODO").length },
              { label: "IN_PROGRESS", count: metrics.inProgressTasks },
              { label: "DONE", count: metrics.completedTasks },
            ].map((item) => {
              const pct = metrics.tasks ? Math.round((item.count / metrics.tasks) * 100) : 0;
              return (
                <div key={item.label} className="grid gap-1">
                  <div className="flex items-center justify-between text-xs text-neutral-300">
                    <span>{item.label}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-900">
                    <div className="h-2 rounded-full bg-white" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardTitle>Reminder Timeline</CardTitle>
          <CardDescription className="mt-2">Pending vs completed reminders.</CardDescription>
          <div className="mt-4 grid gap-2 text-sm">
            <p>Pending: <span className="text-white">{metrics.pendingReminders}</span></p>
            <p>Completed: <span className="text-white">{reminders.filter((r) => r.isCompleted).length}</span></p>
            <p>Overdue: <span className="text-white">{metrics.overdueReminders}</span></p>
            <p>Notes: <span className="text-white">{metrics.notes}</span></p>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle>GitHub Integration</CardTitle>
          <CardDescription className="mt-2">
            Connect username and sync recent events.
          </CardDescription>
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
            <Input
              placeholder="GitHub username"
              value={gitHubUsernameInput}
              onChange={(e) => setGitHubUsernameInput(e.target.value)}
            />
            <Button onClick={onConnectGitHub}>Connect</Button>
            <Button variant="ghost" onClick={onSyncGitHub}>Sync</Button>
            <Button variant="ghost" onClick={onDisconnectGitHub}>Disconnect</Button>
          </div>
          <CardDescription className="mt-3">
            Status: {gitHubStatus.connected ? `Connected as ${gitHubStatus.username}` : "Disconnected"}
          </CardDescription>
          <CardDescription className="mt-1">
            Last Sync: {gitHubStatus.lastSyncedAt ? new Date(gitHubStatus.lastSyncedAt).toLocaleString() : "Never"}
          </CardDescription>
        </Card>

        <Card>
          <CardTitle>GitHub Summary (30d)</CardTitle>
          <CardDescription className="mt-2">Events and top repositories.</CardDescription>
          <div className="mt-4 grid gap-2 text-sm">
            <p>Total Events: <span className="text-white">{gitHubSummary.totalEvents || 0}</span></p>
            <p>Last Activity: <span className="text-white">{gitHubSummary.lastActivityAt ? new Date(gitHubSummary.lastActivityAt).toLocaleString() : "N/A"}</span></p>
          </div>
          <div className="mt-4 grid gap-1 text-xs">
            {(gitHubSummary.topRepos || []).slice(0, 5).map((repo) => (
              <div key={repo.repoName} className="flex justify-between rounded border border-neutral-800 bg-neutral-950 px-2 py-1">
                <span>{repo.repoName}</span>
                <span>{repo.count}</span>
              </div>
            ))}
            {(gitHubSummary.topRepos || []).length === 0 ? (
              <p className="text-neutral-400">No GitHub activity data yet.</p>
            ) : null}
          </div>
        </Card>
      </section>

      <Card>
        <CardTitle>Recent GitHub Activity</CardTitle>
        <CardDescription className="mt-2">Latest synced events.</CardDescription>
        <div className="mt-4 grid gap-2">
          {gitHubActivity.length === 0 ? (
            <p className="text-sm text-neutral-400">No activity synced.</p>
          ) : (
            gitHubActivity.map((event) => (
              <div key={event.id} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs md:text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-white">{event.eventType}</span>
                  <span className="text-neutral-400">{new Date(event.occurredAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-neutral-300">{event.repoName || "Unknown repository"}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      {error ? (
        <Card>
          <CardTitle>Error</CardTitle>
          <CardDescription className="mt-2">{error}</CardDescription>
        </Card>
      ) : null}
    </div>
  );
}
