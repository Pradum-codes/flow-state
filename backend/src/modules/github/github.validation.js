const { z } = require("zod");

const connectGitHubSchema = z.object({
  username: z.string().min(1).max(80),
  accessToken: z.string().min(1).max(500).optional(),
});

const listGitHubActivityQuerySchema = z.object({
  repo: z.string().min(1).optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

const summaryQuerySchema = z.object({
  repo: z.string().min(1).optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
});

module.exports = {
  connectGitHubSchema,
  listGitHubActivityQuerySchema,
  summaryQuerySchema,
};
