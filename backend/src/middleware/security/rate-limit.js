const ApiError = require("../../utils/api-error");

function createInMemoryRateLimiter(options) {
  const {
    windowMs,
    max,
    keyFn = (req) => req.ip || "unknown",
    message = "Too many requests",
  } = options;

  const store = new Map();

  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();
    const key = keyFn(req);
    const bucket = store.get(key);

    if (!bucket || bucket.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
      return next(new ApiError(429, message));
    }

    return next();
  };
}

module.exports = {
  createInMemoryRateLimiter,
};
