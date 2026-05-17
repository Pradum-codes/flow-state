import { request } from "@/lib/api-client";

export function listProjects(token) {
  return request("/projects", { token });
}
