const express = require("express");
const prisma = require("../../config/prisma");
const validate = require("../../middleware/validate");
const { requireAuth } = require("../../middleware/auth");
const ApiError = require("../../utils/api-error");
const { success } = require("../../utils/response");
const {
  createTaskSchema,
  updateTaskSchema,
  projectTaskParamsSchema,
  taskIdParamsSchema,
  listProjectTasksQuerySchema,
} = require("./tasks.validation");

const router = express.Router();

router.use(requireAuth);

async function ensureProjectOwnership(projectId, userId) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return project;
}

router.post(
  "/projects/:projectId/tasks",
  validate(projectTaskParamsSchema, "params"),
  validate(createTaskSchema),
  async (req, res, next) => {
    try {
      await ensureProjectOwnership(req.params.projectId, req.user.id);

      const task = await prisma.task.create({
        data: {
          ...req.body,
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
          ownerId: req.user.id,
          projectId: req.params.projectId,
        },
      });

      return success(res, task, 201);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/projects/:projectId/tasks",
  validate(projectTaskParamsSchema, "params"),
  async (req, res, next) => {
    try {
      await ensureProjectOwnership(req.params.projectId, req.user.id);

      const { status, priority, dueFrom, dueTo, page, limit } =
        listProjectTasksQuerySchema.parse(req.query);
      const skip = (page - 1) * limit;

      const where = {
        ownerId: req.user.id,
        projectId: req.params.projectId,
      };

      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (dueFrom || dueTo) {
        where.dueDate = {};
        if (dueFrom) where.dueDate.gte = new Date(dueFrom);
        if (dueTo) where.dueDate.lte = new Date(dueTo);
      }

      const [items, total] = await Promise.all([
        prisma.task.findMany({
          where,
          orderBy: [{ createdAt: "desc" }],
          skip,
          take: limit,
        }),
        prisma.task.count({ where }),
      ]);

      return success(res, {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/tasks/:id",
  validate(taskIdParamsSchema, "params"),
  validate(updateTaskSchema),
  async (req, res, next) => {
    try {
      const existing = await prisma.task.findFirst({
        where: { id: req.params.id, ownerId: req.user.id },
      });

      if (!existing) {
        throw new ApiError(404, "Task not found");
      }

      const task = await prisma.task.update({
        where: { id: req.params.id },
        data: {
          ...req.body,
          dueDate: req.body.dueDate === undefined
            ? undefined
            : req.body.dueDate
              ? new Date(req.body.dueDate)
              : null,
        },
      });

      return success(res, task);
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/tasks/:id", validate(taskIdParamsSchema, "params"), async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });

    if (!existing) {
      throw new ApiError(404, "Task not found");
    }

    await prisma.task.delete({ where: { id: req.params.id } });
    return success(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
