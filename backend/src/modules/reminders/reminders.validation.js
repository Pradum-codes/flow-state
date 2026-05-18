const { z } = require("zod");

const createReminderSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(2000).optional().nullable(),
  dueAt: z.iso.datetime(),
  recurrence: z.string().max(80).optional().nullable(),
  isCompleted: z.boolean().optional(),
});

const updateReminderSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  description: z.string().max(2000).optional().nullable(),
  dueAt: z.iso.datetime().optional(),
  recurrence: z.string().max(80).optional().nullable(),
  isCompleted: z.boolean().optional(),
});

const reminderIdParamsSchema = z.object({
  id: z.string().min(1),
});

const listRemindersQuerySchema = z.object({
  isCompleted: z.enum(["true", "false"]).optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
});

module.exports = {
  createReminderSchema,
  updateReminderSchema,
  reminderIdParamsSchema,
  listRemindersQuerySchema,
};
