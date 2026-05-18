const express = require("express");
const prisma = require("../../config/prisma");
const validate = require("../../middleware/validate");
const { requireAuth } = require("../../middleware/auth");
const ApiError = require("../../utils/api-error");
const { success } = require("../../utils/response");
const {
  createNoteSchema,
  updateNoteSchema,
  noteIdParamsSchema,
  listNotesQuerySchema,
} = require("./notes.validation");

const router = express.Router();
router.use(requireAuth);

async function ensureProjectOwnership(projectId, userId) {
  if (!projectId) return;
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });
  if (!project) throw new ApiError(404, "Project not found");
}

router.post("/", validate(createNoteSchema), async (req, res, next) => {
  try {
    await ensureProjectOwnership(req.body.projectId, req.user.id);
    const note = await prisma.note.create({
      data: { ...req.body, ownerId: req.user.id },
    });
    return success(res, note, 201);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { projectId } = listNotesQuerySchema.parse(req.query);
    if (projectId) await ensureProjectOwnership(projectId, req.user.id);

    const notes = await prisma.note.findMany({
      where: {
        ownerId: req.user.id,
        ...(projectId ? { projectId } : {}),
      },
      orderBy: { updatedAt: "desc" },
    });
    return success(res, notes);
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:id",
  validate(noteIdParamsSchema, "params"),
  validate(updateNoteSchema),
  async (req, res, next) => {
    try {
      const note = await prisma.note.findFirst({
        where: { id: req.params.id, ownerId: req.user.id },
      });
      if (!note) throw new ApiError(404, "Note not found");

      if (req.body.projectId !== undefined) {
        await ensureProjectOwnership(req.body.projectId, req.user.id);
      }

      const updated = await prisma.note.update({
        where: { id: req.params.id },
        data: req.body,
      });
      return success(res, updated);
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", validate(noteIdParamsSchema, "params"), async (req, res, next) => {
  try {
    const note = await prisma.note.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!note) throw new ApiError(404, "Note not found");

    await prisma.note.delete({ where: { id: req.params.id } });
    return success(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
