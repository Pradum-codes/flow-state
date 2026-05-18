const { ZodError } = require("zod");
const ApiError = require("../utils/api-error");
const { errorPayload } = require("../utils/response");

function reportError(err, req) {
  if (process.env.NODE_ENV === "test") return;
  console.error(
    JSON.stringify({
      level: "error",
      message: err.message,
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      stack: err.stack,
    })
  );
}

function notFoundHandler(req, res) {
  return res.status(404).json(errorPayload("Route not found", "NOT_FOUND"));
}

function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json(errorPayload("Validation failed", "VALIDATION_ERROR", err.issues));
  }

  if (err instanceof ApiError) {
    reportError(err, req);
    return res
      .status(err.statusCode)
      .json(errorPayload(err.message, "API_ERROR", err.details));
  }

  reportError(err, req);
  return res
    .status(500)
    .json(errorPayload("Internal server error", "INTERNAL_ERROR"));
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
