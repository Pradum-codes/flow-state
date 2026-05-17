const { z } = require("zod");

const taskStatus = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
const taskPriority = z.enum(["LOW", "MEDIUM", "HIGH"]);

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  status: taskStatus.optional(),
  priority: taskPriority.optional(),
  dueDate: z.iso.datetime().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: taskStatus.optional(),
  priority: taskPriority.optional(),
  dueDate: z.iso.datetime().optional().nullable(),
});

const projectTaskParamsSchema = z.object({
  projectId: z.string().min(1),
});

const taskIdParamsSchema = z.object({
  id: z.string().min(1),
});

const listProjectTasksQuerySchema = z.object({
  status: taskStatus.optional(),
  priority: taskPriority.optional(),
  dueFrom: z.iso.datetime().optional(),
  dueTo: z.iso.datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  projectTaskParamsSchema,
  taskIdParamsSchema,
  listProjectTasksQuerySchema,
};
