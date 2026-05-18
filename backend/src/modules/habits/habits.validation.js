const { z } = require("zod");

const createHabitSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
});

const updateHabitSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  description: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
});

const habitIdParamsSchema = z.object({
  id: z.string().min(1),
});

const habitEntryParamsSchema = z.object({
  id: z.string().min(1),
});

const createHabitEntrySchema = z.object({
  date: z.iso.datetime(),
  completed: z.boolean().optional(),
  notes: z.string().max(1000).optional().nullable(),
});

const listHabitEntriesQuerySchema = z.object({
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

module.exports = {
  createHabitSchema,
  updateHabitSchema,
  habitIdParamsSchema,
  habitEntryParamsSchema,
  createHabitEntrySchema,
  listHabitEntriesQuerySchema,
};
