const express = require("express");
const authRoutes = require("./modules/auth/auth.routes");
const projectRoutes = require("./modules/projects/projects.routes");
const taskRoutes = require("./modules/tasks/tasks.routes");
const habitRoutes = require("./modules/habits/habits.routes");
const reminderRoutes = require("./modules/reminders/reminders.routes");
const noteRoutes = require("./modules/notes/notes.routes");
const { success } = require("./utils/response");

const router = express.Router();

router.get("/health", (req, res) => {
  return success(res, { status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/", taskRoutes);
router.use("/habits", habitRoutes);
router.use("/reminders", reminderRoutes);
router.use("/notes", noteRoutes);

module.exports = router;
