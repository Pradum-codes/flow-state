const express = require("express");
const prisma = require("../../config/prisma");
const validate = require("../../middleware/validate");
const { requireAuth } = require("../../middleware/auth");
const ApiError = require("../../utils/api-error");
const { success } = require("../../utils/response");
const {
  createReminderSchema,
  updateReminderSchema,
  reminderIdParamsSchema,
  listRemindersQuerySchema,
} = require("./reminders.validation");

const router = express.Router();
router.use(requireAuth);

router.post("/", validate(createReminderSchema), async (req, res, next) => {
  try {
    const reminder = await prisma.reminder.create({
      data: {
        ...req.body,
        dueAt: new Date(req.body.dueAt),
        ownerId: req.user.id,
      },
    });
    return success(res, reminder, 201);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { isCompleted, from, to } = listRemindersQuerySchema.parse(req.query);
    const where = { ownerId: req.user.id };
    if (isCompleted !== undefined) where.isCompleted = isCompleted === "true";
    if (from || to) {
      where.dueAt = {};
      if (from) where.dueAt.gte = new Date(from);
      if (to) where.dueAt.lte = new Date(to);
    }

    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: { dueAt: "asc" },
    });
    return success(res, reminders);
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:id",
  validate(reminderIdParamsSchema, "params"),
  validate(updateReminderSchema),
  async (req, res, next) => {
    try {
      const reminder = await prisma.reminder.findFirst({
        where: { id: req.params.id, ownerId: req.user.id },
      });
      if (!reminder) throw new ApiError(404, "Reminder not found");

      const updated = await prisma.reminder.update({
        where: { id: req.params.id },
        data: {
          ...req.body,
          dueAt: req.body.dueAt ? new Date(req.body.dueAt) : undefined,
        },
      });
      return success(res, updated);
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", validate(reminderIdParamsSchema, "params"), async (req, res, next) => {
  try {
    const reminder = await prisma.reminder.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!reminder) throw new ApiError(404, "Reminder not found");

    await prisma.reminder.delete({ where: { id: req.params.id } });
    return success(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
