const express = require("express");
const prisma = require("../../config/prisma");
const validate = require("../../middleware/validate");
const { requireAuth } = require("../../middleware/auth");
const ApiError = require("../../utils/api-error");
const { success } = require("../../utils/response");
const {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamsSchema,
  listProjectsQuerySchema,
} = require("./projects.validation");

const router = express.Router();

router.use(requireAuth);

router.post("/", validate(createProjectSchema), async (req, res, next) => {
  try {
    const project = await prisma.project.create({
      data: {
        ...req.body,
        ownerId: req.user.id,
      },
    });

    return success(res, project, 201);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { page, limit, sort, order } = listProjectsQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;
    const where = { ownerId: req.user.id };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
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
});

router.get("/:id", validate(projectIdParamsSchema, "params"), async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    return success(res, project);
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:id",
  validate(projectIdParamsSchema, "params"),
  validate(updateProjectSchema),
  async (req, res, next) => {
    try {
      const exists = await prisma.project.findFirst({
        where: { id: req.params.id, ownerId: req.user.id },
      });

      if (!exists) {
        throw new ApiError(404, "Project not found");
      }

      const project = await prisma.project.update({
        where: { id: req.params.id },
        data: req.body,
      });

      return success(res, project);
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", validate(projectIdParamsSchema, "params"), async (req, res, next) => {
  try {
    const exists = await prisma.project.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });

    if (!exists) {
      throw new ApiError(404, "Project not found");
    }

    await prisma.project.delete({ where: { id: req.params.id } });
    return success(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
