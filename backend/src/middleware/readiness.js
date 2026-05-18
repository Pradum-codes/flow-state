const prisma = require("../config/prisma");
const { success } = require("../utils/response");

async function readinessHandler(req, res, next) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return success(res, {
      status: "ready",
      dependencies: {
        database: "ok",
      },
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      error: {
        code: "DEPENDENCY_UNAVAILABLE",
        message: "Service not ready",
        details: [
          {
            dependency: "database",
            status: "error",
          },
        ],
      },
    });
  }
}

module.exports = {
  readinessHandler,
};
