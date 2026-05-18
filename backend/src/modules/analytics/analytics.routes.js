const express = require("express");
const { requireAuth } = require("../../middleware/auth");
const { success } = require("../../utils/response");
const {
  getDashboardOverview,
  getProductivityScore,
  getWeeklyProgress,
  getHeatmap,
} = require("../../services/analytics.service");
const {
  dateRangeQuerySchema,
  weeklyProgressQuerySchema,
  heatmapQuerySchema,
} = require("./analytics.validation");

const router = express.Router();
router.use(requireAuth);

router.get("/dashboard/overview", async (req, res, next) => {
  try {
    const data = await getDashboardOverview(req.user.id);
    return success(res, data);
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/productivity-score", async (req, res, next) => {
  try {
    const { from, to } = dateRangeQuerySchema.parse(req.query);
    const data = await getProductivityScore(req.user.id, from, to);
    return success(res, data);
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/weekly-progress", async (req, res, next) => {
  try {
    const { weeks } = weeklyProgressQuerySchema.parse(req.query);
    const data = await getWeeklyProgress(req.user.id, weeks);
    return success(res, data);
  } catch (error) {
    next(error);
  }
});

router.get("/analytics/heatmap", async (req, res, next) => {
  try {
    const { days } = heatmapQuerySchema.parse(req.query);
    const data = await getHeatmap(req.user.id, days);
    return success(res, data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
