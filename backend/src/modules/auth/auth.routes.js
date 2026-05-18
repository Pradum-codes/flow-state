const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma");
const env = require("../../config/env");
const validate = require("../../middleware/validate");
const { requireAuth } = require("../../middleware/auth");
const { createInMemoryRateLimiter } = require("../../middleware/security/rate-limit");
const { registerSchema, loginSchema } = require("./auth.validation");
const ApiError = require("../../utils/api-error");
const { success } = require("../../utils/response");

const router = express.Router();
const authLimiter = createInMemoryRateLimiter({
  windowMs: env.authRateLimitWindowMs,
  max: env.authRateLimitMax,
  keyFn: (req) => `${req.ip || "unknown"}:${req.body.email || "anonymous"}`,
  message: "Too many authentication attempts. Please try again later.",
});

function buildToken(userId) {
  return jwt.sign({}, env.jwtSecret, {
    subject: userId,
    expiresIn: env.jwtExpiresIn,
  });
}

router.post("/register", authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: req.body.email.toLowerCase() },
    });

    if (existing) {
      throw new ApiError(409, "Email is already registered");
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
      data: {
        email: req.body.email.toLowerCase(),
        name: req.body.name,
        passwordHash,
      },
    });

    const token = buildToken(user.id);
    return success(
      res,
      {
        token,
        user: { id: user.id, email: user.email, name: user.name },
      },
      201
    );
  } catch (error) {
    next(error);
  }
});

router.post("/login", authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email.toLowerCase() },
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isValid = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!isValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = buildToken(user.id);
    return success(res, {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    return success(res, { user: req.user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
