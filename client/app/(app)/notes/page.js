"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/providers/auth-provider";
import { listProjects } from "@/services/projects";
import { createNote, deleteNote, listNotes } from "@/services/productivity";

export default function NotesPage() {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState("");
  const [filterProjectId, setFilterProjectId] = useState("");
  const [error, setError] = useState("");

  async function loadProjects() {
    if (!token) return;
    try {
      const res = await listProjects(token);
      setProjects(res?.items || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadNotes() {
    if (!token) return;
    try {
      const query = new URLSearchParams();
      if (filterProjectId) query.set("projectId", filterProjectId);
      const items = await listNotes(token, query.toString());
      setNotes(items || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProjects();
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotes();
  }, [token, filterProjectId]);

  async function onCreate(e) {
    e.preventDefault();
    if (!token || !content.trim()) return;
    setError("");
    try {
      const created = await createNote(token, {
        title: title.trim() || undefined,
        content: content.trim(),
        projectId: projectId || undefined,
      });
      setNotes((prev) => [created, ...prev]);
      setTitle("");
      setContent("");
      setProjectId("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(noteId) {
    if (!token) return;
    try {
      await deleteNote(token, noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardTitle>Notes</CardTitle>
        <CardDescription className="mt-2">
          Capture personal notes and attach them to projects.
        </CardDescription>
        <form className="mt-4 grid gap-2" onSubmit={onCreate}>
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <Textarea
            placeholder="Write your note..."
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <Button>Create Note</Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Filter</CardTitle>
        <div className="mt-3">
          <select
            className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value)}
          >
            <option value="">All notes</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <section className="grid gap-3 md:grid-cols-2">
        {notes.length === 0 ? (
          <Card>
            <CardDescription>No notes yet.</CardDescription>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <CardTitle>{note.title || "Untitled Note"}</CardTitle>
              <CardDescription className="mt-2 text-neutral-300">
                {note.content}
              </CardDescription>
              <CardDescription className="mt-2">
                {note.projectId ? `Project-linked` : "Personal note"}
              </CardDescription>
              <div className="mt-4">
                <Button variant="ghost" onClick={() => onDelete(note.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
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
