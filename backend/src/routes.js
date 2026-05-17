const express = require("express");
const authRoutes = require("./modules/auth/auth.routes");
const projectRoutes = require("./modules/projects/projects.routes");
const taskRoutes = require("./modules/tasks/tasks.routes");
const { success } = require("./utils/response");

const router = express.Router();

router.get("/health", (req, res) => {
  return success(res, { status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/", taskRoutes);

module.exports = router;
