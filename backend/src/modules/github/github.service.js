const prisma = require("../../config/prisma");
const ApiError = require("../../utils/api-error");

const GITHUB_API_BASE = "https://api.github.com";
const RETRY_STATUS = new Set([403, 429, 500, 502, 503, 504]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, maxAttempts = 3) {
  let attempt = 0;
  let lastError;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (!RETRY_STATUS.has(res.status) || attempt === maxAttempts) return res;

      const retryAfter = Number(res.headers.get("retry-after")) || 0;
      const waitMs = retryAfter > 0 ? retryAfter * 1000 : 300 * attempt;
      await sleep(waitMs);
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) throw error;
      await sleep(300 * attempt);
    }
  }

  if (lastError) throw lastError;
  throw new Error("Failed to fetch GitHub API");
}

function normalizeEvent(event) {
  return {
    eventId: String(event.id),
    eventType: event.type,
    repoName: event.repo?.name || null,
    occurredAt: new Date(event.created_at),
    payload: event,
  };
}

async function fetchUserEvents(username, accessToken) {
  const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/events?per_page=100`;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "flowstate-backend",
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetchWithRetry(url, { headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      res.status === 404 ? 404 : 502,
      data?.message || "Failed to fetch GitHub activity"
    );
  }

  if (!Array.isArray(data)) return [];
  return data.map(normalizeEvent);
}

async function syncGitHubActivityForUser(userId) {
  const connection = await prisma.gitHubConnection.findUnique({
    where: { userId },
  });

  if (!connection) {
    throw new ApiError(404, "GitHub integration not connected");
  }

  const events = await fetchUserEvents(connection.username, connection.accessToken || undefined);
  if (events.length === 0) {
    await prisma.gitHubConnection.update({
      where: { id: connection.id },
      data: { lastSyncedAt: new Date() },
    });
    return { inserted: 0, totalFetched: 0 };
  }

  let inserted = 0;
  for (const event of events) {
    try {
      await prisma.gitHubActivity.create({
        data: {
          ...event,
          userId,
          connectionId: connection.id,
        },
      });
      inserted += 1;
    } catch (error) {
      if (error.code !== "P2002") throw error;
    }
  }

  await prisma.gitHubConnection.update({
    where: { id: connection.id },
    data: { lastSyncedAt: new Date() },
  });

  return { inserted, totalFetched: events.length };
}

module.exports = {
  syncGitHubActivityForUser,
};
