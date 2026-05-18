const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

const defaultTimeoutMs = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 15000);
const getCache = new Map();

async function request(path, options = {}) {
  const { token, timeoutMs = defaultTimeoutMs, cacheMs = 0, ...rest } = options;
  const method = (rest.method || "GET").toUpperCase();
  const cacheKey = `${method}:${path}:${token || "anon"}`;

  if (method === "GET" && cacheMs > 0) {
    const cached = getCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      ...rest,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(rest.headers || {}),
      },
      cache: method === "GET" ? "force-cache" : "no-store",
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      const timeoutError = new Error("Request timed out. Please try again.");
      timeoutError.status = 408;
      throw timeoutError;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error?.message || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const value = payload?.data ?? payload;
  if (method === "GET" && cacheMs > 0) {
    getCache.set(cacheKey, {
      value,
      expiresAt: Date.now() + cacheMs,
    });
  }

  return value;
}

export async function getHealth() {
  return request("/health");
}

export { API_BASE_URL, request };
