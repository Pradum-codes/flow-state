const express = require("express");
const prisma = require("../../config/prisma");
const validate = require("../../middleware/validate");
const { requireAuth } = require("../../middleware/auth");
const { success } = require("../../utils/response");
const {
  connectGitHubSchema,
  listGitHubActivityQuerySchema,
  summaryQuerySchema,
} = require("./github.validation");
const { syncGitHubActivityForUser } = require("./github.service");

const router = express.Router();
router.use(requireAuth);

router.post("/integrations/github/connect", validate(connectGitHubSchema), async (req, res, next) => {
  try {
    const connection = await prisma.gitHubConnection.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        username: req.body.username,
        accessToken: req.body.accessToken || null,
      },
      update: {
        username: req.body.username,
        accessToken: req.body.accessToken || null,
      },
    });

    return success(res, {
      id: connection.id,
      username: connection.username,
      lastSyncedAt: connection.lastSyncedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/integrations/github/disconnect", async (req, res, next) => {
  try {
    await prisma.gitHubConnection.deleteMany({ where: { userId: req.user.id } });
    return success(res, { disconnected: true });
  } catch (error) {
    next(error);
  }
});

router.get("/integrations/github/status", async (req, res, next) => {
  try {
    const connection = await prisma.gitHubConnection.findUnique({
      where: { userId: req.user.id },
    });

    return success(res, {
      connected: Boolean(connection),
      username: connection?.username || null,
      lastSyncedAt: connection?.lastSyncedAt || null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/github/sync", async (req, res, next) => {
  try {
    const result = await syncGitHubActivityForUser(req.user.id);
    return success(res, result);
  } catch (error) {
    next(error);
  }
});

router.get("/github/activity", async (req, res, next) => {
  try {
    const { repo, from, to, page, limit } = listGitHubActivityQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (repo) where.repoName = repo;
    if (from || to) {
      where.occurredAt = {};
      if (from) where.occurredAt.gte = new Date(from);
      if (to) where.occurredAt.lte = new Date(to);
    }

    const [items, total] = await Promise.all([
      prisma.gitHubActivity.findMany({
        where,
        orderBy: { occurredAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.gitHubActivity.count({ where }),
    ]);

    return success(res, {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/github/summary", async (req, res, next) => {
  try {
    const { repo, from, to } = summaryQuerySchema.parse(req.query);
    const where = { userId: req.user.id };
    if (repo) where.repoName = repo;
    if (from || to) {
      where.occurredAt = {};
      if (from) where.occurredAt.gte = new Date(from);
      if (to) where.occurredAt.lte = new Date(to);
    }

    const [totalEvents, byType, byRepo, lastEvent] = await Promise.all([
      prisma.gitHubActivity.count({ where }),
      prisma.gitHubActivity.groupBy({
        by: ["eventType"],
        where,
        _count: { _all: true },
        orderBy: { _count: { eventType: "desc" } },
      }),
      prisma.gitHubActivity.groupBy({
        by: ["repoName"],
        where,
        _count: { _all: true },
        orderBy: { _count: { repoName: "desc" } },
        take: 10,
      }),
      prisma.gitHubActivity.findFirst({
        where,
        orderBy: { occurredAt: "desc" },
      }),
    ]);

    return success(res, {
      totalEvents,
      byType: byType.map((item) => ({ eventType: item.eventType, count: item._count._all })),
      topRepos: byRepo
        .filter((item) => item.repoName)
        .map((item) => ({ repoName: item.repoName, count: item._count._all })),
      lastActivityAt: lastEvent?.occurredAt || null,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
