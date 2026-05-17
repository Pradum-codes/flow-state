const { z } = require("zod");

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(80).optional(),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

module.exports = {
  registerSchema,
  loginSchema,
};
