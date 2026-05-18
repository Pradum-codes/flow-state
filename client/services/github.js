import { request } from "@/lib/api-client";

export function getGitHubStatus(token) {
  return request("/integrations/github/status", { token, cacheMs: 10_000 });
}

export function connectGitHub(token, payload) {
  return request("/integrations/github/connect", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function disconnectGitHub(token) {
  return request("/integrations/github/disconnect", {
    method: "DELETE",
    token,
  });
}

export function syncGitHub(token) {
  return request("/github/sync", {
    method: "POST",
    token,
  });
}

export function getGitHubSummary(token, query = "") {
  return request(`/github/summary${query ? `?${query}` : ""}`, { token, cacheMs: 10_000 });
}

export function getGitHubActivity(token, query = "") {
  return request(`/github/activity${query ? `?${query}` : ""}`, { token, cacheMs: 8_000 });
}
