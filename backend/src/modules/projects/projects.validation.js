const { z } = require("zod");

const projectStatus = z.enum(["ACTIVE", "ON_HOLD", "COMPLETED"]);

const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional().nullable(),
  status: projectStatus.optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).optional().nullable(),
  status: projectStatus.optional(),
});

const projectIdParamsSchema = z.object({
  id: z.string().min(1),
});

const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(["createdAt", "updatedAt", "name"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamsSchema,
  listProjectsQuerySchema,
};
