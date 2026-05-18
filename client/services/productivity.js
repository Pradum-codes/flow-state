import { request } from "@/lib/api-client";

export function listHabits(token) {
  return request("/habits", { token });
}

export function createHabit(token, payload) {
  return request("/habits", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateHabit(token, habitId, payload) {
  return request(`/habits/${habitId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteHabit(token, habitId) {
  return request(`/habits/${habitId}`, {
    method: "DELETE",
    token,
  });
}

export function upsertHabitEntry(token, habitId, payload) {
  return request(`/habits/${habitId}/entries`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function listReminders(token, query = "") {
  return request(`/reminders${query ? `?${query}` : ""}`, { token });
}

export function createReminder(token, payload) {
  return request("/reminders", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateReminder(token, reminderId, payload) {
  return request(`/reminders/${reminderId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteReminder(token, reminderId) {
  return request(`/reminders/${reminderId}`, {
    method: "DELETE",
    token,
  });
}

export function listNotes(token, query = "") {
  return request(`/notes${query ? `?${query}` : ""}`, { token });
}

export function createNote(token, payload) {
  return request("/notes", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateNote(token, noteId, payload) {
  return request(`/notes/${noteId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteNote(token, noteId) {
  return request(`/notes/${noteId}`, {
    method: "DELETE",
    token,
  });
}
