"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/providers/auth-provider";
import {
  createProject,
  createTask,
  deleteProject,
  deleteTask,
  listProjects,
  listProjectTasks,
  updateTask,
} from "@/services/projects";

export default function ProjectsPage() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("");

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const loadProjects = useCallback(async () => {
    if (!token) return;
    setLoadingProjects(true);
    setError("");
    try {
      const res = await listProjects(token);
      const next = res?.items || [];
      setProjects(next);
      setSelectedProjectId((prev) => prev || next[0]?.id || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingProjects(false);
    }
  }, [token]);

  const loadTasks = useCallback(async (projectId) => {
    if (!token || !projectId) return;
    setLoadingTasks(true);
    setError("");
    try {
      const query = new URLSearchParams();
      if (taskStatusFilter) query.set("status", taskStatusFilter);
      if (taskPriorityFilter) query.set("priority", taskPriorityFilter);
      const res = await listProjectTasks(token, projectId, query.toString());
      setTasks(res?.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTasks(false);
    }
  }, [token, taskPriorityFilter, taskStatusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (!selectedProjectId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTasks(selectedProjectId);
  }, [selectedProjectId, loadTasks]);

  async function onCreateProject(e) {
    e.preventDefault();
    if (!token || !projectName.trim()) return;
    setError("");
    try {
      const project = await createProject(token, {
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
      });
      setProjects((prev) => [project, ...prev]);
      setSelectedProjectId(project.id);
      setProjectName("");
      setProjectDescription("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDeleteProject(projectId) {
    if (!token) return;
    setError("");
    try {
      await deleteProject(token, projectId);
      const next = projects.filter((project) => project.id !== projectId);
      setProjects(next);
      const nextSelected = next[0]?.id || "";
      setSelectedProjectId(nextSelected);
      setTasks([]);
      if (nextSelected) await loadTasks(nextSelected);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onCreateTask(e) {
    e.preventDefault();
    if (!token || !selectedProjectId || !taskTitle.trim()) return;
    setError("");
    try {
      const created = await createTask(token, selectedProjectId, {
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        priority: taskPriority,
      });
      setTasks((prev) => [created, ...prev]);
      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("MEDIUM");
    } catch (err) {
      setError(err.message);
    }
  }

  async function onToggleTaskStatus(task) {
    if (!token) return;
    const nextStatus =
      task.status === "TODO" ? "IN_PROGRESS" : task.status === "IN_PROGRESS" ? "DONE" : "TODO";
    try {
      const updated = await updateTask(token, task.id, { status: nextStatus });
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDeleteTask(taskId) {
    if (!token) return;
    try {
      await deleteTask(token, taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="h-fit">
          <CardTitle>Projects</CardTitle>
          <CardDescription className="mt-3">
            Create and manage your project workspaces.
          </CardDescription>
          <form className="mt-4 grid gap-2" onSubmit={onCreateProject}>
            <Input
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
            <Textarea
              placeholder="Description (optional)"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={3}
            />
            <Button>Create Project</Button>
          </form>

          <div className="mt-5 grid gap-2">
            {loadingProjects ? <p className="text-sm text-neutral-300">Loading projects...</p> : null}
            {!loadingProjects && projects.length === 0 ? (
              <p className="text-sm text-neutral-300">No projects yet.</p>
            ) : null}
            {projects.map((project) => (
              <div
                key={project.id}
                className={`rounded-xl border p-3 ${
                  selectedProjectId === project.id
                    ? "border-white bg-neutral-900"
                    : "border-neutral-800 bg-neutral-950"
                }`}
              >
                <button
                  className="w-full text-left"
                  onClick={() => setSelectedProjectId(project.id)}
                  type="button"
                >
                  <p className="text-sm text-white">{project.name}</p>
                  <p className="mt-1 text-xs text-neutral-400">{project.status}</p>
                </button>
                <Button
                  className="mt-3 w-full"
                  variant="ghost"
                  onClick={() => onDeleteProject(project.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>{selectedProject ? selectedProject.name : "Tasks"}</CardTitle>
          <CardDescription className="mt-3">
            Plan and execute tasks with status and priority controls.
          </CardDescription>

          {selectedProject ? (
            <>
              <form className="mt-4 grid gap-2 md:grid-cols-2" onSubmit={onCreateTask}>
                <div className="md:col-span-2">
                  <Input
                    placeholder="Task title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    placeholder="Task description (optional)"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <select
                  className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
                <Button>Create Task</Button>
              </form>

              <div className="mt-4 grid gap-2 md:grid-cols-2">
                <select
                  className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
                <select
                  className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
                  value={taskPriorityFilter}
                  onChange={(e) => setTaskPriorityFilter(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div className="mt-5 grid gap-2">
                {loadingTasks ? <p className="text-sm text-neutral-300">Loading tasks...</p> : null}
                {!loadingTasks && tasks.length === 0 ? (
                  <p className="text-sm text-neutral-300">No tasks yet for this project.</p>
                ) : null}
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-white">{task.title}</p>
                      <p className="text-xs text-neutral-400">
                        {task.status} • {task.priority}
                      </p>
                    </div>
                    {task.description ? (
                      <p className="mt-2 text-xs text-neutral-300">{task.description}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button variant="ghost" onClick={() => onToggleTaskStatus(task)}>
                        Cycle Status
                      </Button>
                      <Button variant="ghost" onClick={() => onDeleteTask(task.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-neutral-300">Select a project to manage tasks.</p>
          )}
        </Card>
      </section>

      {error ? (
        <Card>
          <CardTitle>Error</CardTitle>
          <CardDescription className="mt-2">{error}</CardDescription>
        </Card>
      ) : null}
    </div>
  );
}
