const express = require("express");
const prisma = require("../../config/prisma");
const validate = require("../../middleware/validate");
const { requireAuth } = require("../../middleware/auth");
const ApiError = require("../../utils/api-error");
const { success } = require("../../utils/response");
const {
  createHabitSchema,
  updateHabitSchema,
  habitIdParamsSchema,
  habitEntryParamsSchema,
  createHabitEntrySchema,
  listHabitEntriesQuerySchema,
} = require("./habits.validation");

const router = express.Router();
router.use(requireAuth);

router.post("/", validate(createHabitSchema), async (req, res, next) => {
  try {
    const habit = await prisma.habit.create({
      data: { ...req.body, ownerId: req.user.id },
    });
    return success(res, habit, 201);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    return success(res, habits);
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:id",
  validate(habitIdParamsSchema, "params"),
  validate(updateHabitSchema),
  async (req, res, next) => {
    try {
      const habit = await prisma.habit.findFirst({
        where: { id: req.params.id, ownerId: req.user.id },
      });
      if (!habit) throw new ApiError(404, "Habit not found");

      const updated = await prisma.habit.update({
        where: { id: req.params.id },
        data: req.body,
      });
      return success(res, updated);
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", validate(habitIdParamsSchema, "params"), async (req, res, next) => {
  try {
    const habit = await prisma.habit.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!habit) throw new ApiError(404, "Habit not found");

    await prisma.habit.delete({ where: { id: req.params.id } });
    return success(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:id/entries",
  validate(habitEntryParamsSchema, "params"),
  validate(createHabitEntrySchema),
  async (req, res, next) => {
    try {
      const habit = await prisma.habit.findFirst({
        where: { id: req.params.id, ownerId: req.user.id },
      });
      if (!habit) throw new ApiError(404, "Habit not found");

      const entry = await prisma.habitEntry.upsert({
        where: {
          habitId_date: { habitId: req.params.id, date: new Date(req.body.date) },
        },
        update: {
          completed: req.body.completed ?? true,
          notes: req.body.notes,
        },
        create: {
          habitId: req.params.id,
          ownerId: req.user.id,
          date: new Date(req.body.date),
          completed: req.body.completed ?? true,
          notes: req.body.notes,
        },
      });
      return success(res, entry, 201);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id/entries",
  validate(habitEntryParamsSchema, "params"),
  async (req, res, next) => {
    try {
      const habit = await prisma.habit.findFirst({
        where: { id: req.params.id, ownerId: req.user.id },
      });
      if (!habit) throw new ApiError(404, "Habit not found");

      const { from, to, page, limit } = listHabitEntriesQuerySchema.parse(req.query);
      const skip = (page - 1) * limit;
      const where = { habitId: req.params.id, ownerId: req.user.id };
      if (from || to) {
        where.date = {};
        if (from) where.date.gte = new Date(from);
        if (to) where.date.lte = new Date(to);
      }

      const [items, total] = await Promise.all([
        prisma.habitEntry.findMany({
          where,
          orderBy: { date: "desc" },
          skip,
          take: limit,
        }),
        prisma.habitEntry.count({ where }),
      ]);

      return success(res, {
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
