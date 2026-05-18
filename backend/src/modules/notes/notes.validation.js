const { z } = require("zod");

const createNoteSchema = z.object({
  title: z.string().max(180).optional().nullable(),
  content: z.string().min(1).max(10000),
  projectId: z.string().min(1).optional().nullable(),
});

const updateNoteSchema = z.object({
  title: z.string().max(180).optional().nullable(),
  content: z.string().min(1).max(10000).optional(),
  projectId: z.string().min(1).optional().nullable(),
});

const noteIdParamsSchema = z.object({
  id: z.string().min(1),
});

const listNotesQuerySchema = z.object({
  projectId: z.string().min(1).optional(),
});

module.exports = {
  createNoteSchema,
  updateNoteSchema,
  noteIdParamsSchema,
  listNotesQuerySchema,
};
