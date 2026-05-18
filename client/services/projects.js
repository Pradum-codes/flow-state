import { request } from "@/lib/api-client";

export function listProjects(token, query = "") {
  return request(`/projects${query ? `?${query}` : ""}`, { token });
}

export function createProject(token, payload) {
  return request("/projects", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateProject(token, projectId, payload) {
  return request(`/projects/${projectId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteProject(token, projectId) {
  return request(`/projects/${projectId}`, {
    method: "DELETE",
    token,
  });
}

export function listProjectTasks(token, projectId, query = "") {
  return request(`/projects/${projectId}/tasks${query ? `?${query}` : ""}`, { token });
}

export function createTask(token, projectId, payload) {
  return request(`/projects/${projectId}/tasks`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateTask(token, taskId, payload) {
  return request(`/tasks/${taskId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteTask(token, taskId) {
  return request(`/tasks/${taskId}`, {
    method: "DELETE",
    token,
  });
}
