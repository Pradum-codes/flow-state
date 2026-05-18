const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const env = require("./config/env");
const requestContext = require("./middleware/request-context");
const secureHeaders = require("./middleware/security/secure-headers");
const { createInMemoryRateLimiter } = require("./middleware/security/rate-limit");
const { notFoundHandler, errorHandler } = require("./middleware/error-handler");

const app = express();

const allowAllOrigins = env.corsOrigin === "*";
const corsAllowedOrigins = allowAllOrigins
  ? []
  : env.corsOrigin.split(",").map((value) => value.trim()).filter(Boolean);

const globalRateLimiter = createInMemoryRateLimiter({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  message: "Rate limit exceeded",
});

app.set("trust proxy", 1);
app.use(requestContext);
app.use(secureHeaders);
app.use(
  cors({
    origin(origin, callback) {
      if (allowAllOrigins || !origin || corsAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin denied"));
    },
  })
);
app.use(express.json({ limit: env.requestBodyLimit }));
app.use(globalRateLimiter);
morgan.token("requestId", (req) => req.requestId);
app.use(morgan(":method :url :status :response-time ms req_id=:requestId"));

app.use("/api/v1", routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
