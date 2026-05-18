"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/providers/auth-provider";
import {
  createHabit,
  deleteHabit,
  listHabits,
  upsertHabitEntry,
} from "@/services/productivity";

export default function HabitsPage() {
  const { token } = useAuth();
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function loadHabits() {
    if (!token) return;
    try {
      const items = await listHabits(token);
      setHabits(items || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHabits();
  }, [token]);

  async function onCreate(e) {
    e.preventDefault();
    if (!token || !title.trim()) return;
    setError("");
    try {
      const created = await createHabit(token, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setHabits((prev) => [created, ...prev]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function onCheckIn(habitId) {
    if (!token) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
      await upsertHabitEntry(token, habitId, {
        date: today.toISOString(),
        completed: true,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(habitId) {
    if (!token) return;
    try {
      await deleteHabit(token, habitId);
      setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardTitle>Habits</CardTitle>
        <CardDescription className="mt-2">
          Track routines with daily check-ins and consistency.
        </CardDescription>
        <form className="mt-4 grid gap-2 md:grid-cols-2" onSubmit={onCreate}>
          <div className="md:col-span-2">
            <Input
              placeholder="Habit title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Textarea
              placeholder="Description (optional)"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button>Create Habit</Button>
        </form>
      </Card>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {habits.length === 0 ? (
          <Card>
            <CardDescription>No habits yet.</CardDescription>
          </Card>
        ) : (
          habits.map((habit) => (
            <Card key={habit.id}>
              <CardTitle>{habit.title}</CardTitle>
              <CardDescription className="mt-2">
                {habit.description || "No description"}
              </CardDescription>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => onCheckIn(habit.id)}>
                  Check In
                </Button>
                <Button variant="ghost" onClick={() => onDelete(habit.id)}>
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
