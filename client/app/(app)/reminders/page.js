"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/providers/auth-provider";
import {
  createReminder,
  deleteReminder,
  listReminders,
  updateReminder,
} from "@/services/productivity";

export default function RemindersPage() {
  const { token } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState("");
  const [filterCompleted, setFilterCompleted] = useState("");

  async function loadReminders() {
    if (!token) return;
    try {
      const query = new URLSearchParams();
      if (filterCompleted) query.set("isCompleted", filterCompleted);
      const items = await listReminders(token, query.toString());
      setReminders(items || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReminders();
  }, [token, filterCompleted]);

  async function onCreate(e) {
    e.preventDefault();
    if (!token || !title.trim() || !dueAt) return;
    setError("");
    try {
      const created = await createReminder(token, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueAt: new Date(dueAt).toISOString(),
      });
      setReminders((prev) => [...prev, created]);
      setTitle("");
      setDescription("");
      setDueAt("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function onToggle(reminder) {
    if (!token) return;
    try {
      const updated = await updateReminder(token, reminder.id, {
        isCompleted: !reminder.isCompleted,
      });
      setReminders((prev) => prev.map((item) => (item.id === reminder.id ? updated : item)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(reminderId) {
    if (!token) return;
    try {
      await deleteReminder(token, reminderId);
      setReminders((prev) => prev.filter((item) => item.id !== reminderId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardTitle>Reminders</CardTitle>
        <CardDescription className="mt-2">
          Manage deadlines and recurring reminders.
        </CardDescription>
        <form className="mt-4 grid gap-2 md:grid-cols-2" onSubmit={onCreate}>
          <div className="md:col-span-2">
            <Input
              placeholder="Reminder title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Textarea
              rows={3}
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            required
          />
          <Button>Create Reminder</Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Filter</CardTitle>
        <div className="mt-3">
          <select
            className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
            value={filterCompleted}
            onChange={(e) => setFilterCompleted(e.target.value)}
          >
            <option value="">All</option>
            <option value="false">Pending</option>
            <option value="true">Completed</option>
          </select>
        </div>
      </Card>

      <section className="grid gap-3 md:grid-cols-2">
        {reminders.length === 0 ? (
          <Card>
            <CardDescription>No reminders available.</CardDescription>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardTitle>{reminder.title}</CardTitle>
              <CardDescription className="mt-2">
                {new Date(reminder.dueAt).toLocaleString()}
              </CardDescription>
              <CardDescription className="mt-1">
                {reminder.description || "No description"}
              </CardDescription>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => onToggle(reminder)}>
                  {reminder.isCompleted ? "Mark Pending" : "Mark Done"}
                </Button>
                <Button variant="ghost" onClick={() => onDelete(reminder.id)}>
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
