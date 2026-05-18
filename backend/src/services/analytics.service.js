const prisma = require("../config/prisma");

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function clampDateRange(from, to) {
  const now = new Date();
  const safeTo = to ? new Date(to) : now;
  const safeFrom = from ? new Date(from) : addUtcDays(safeTo, -30);

  if (safeFrom > safeTo) {
    return { from: safeTo, to: safeFrom };
  }

  return { from: safeFrom, to: safeTo };
}

async function getDashboardOverview(userId) {
  const now = new Date();
  const todayStart = startOfUtcDay(now);
  const tomorrowStart = addUtcDays(todayStart, 1);
  const sevenDaysOut = addUtcDays(todayStart, 7);

  const [
    activeProjects,
    dueTodayTasks,
    upcomingReminders,
    completedHabitsToday,
    activeHabits,
    githubConnection,
    githubEvents7d,
    overdueReminders,
  ] = await Promise.all([
    prisma.project.count({ where: { ownerId: userId, status: "ACTIVE" } }),
    prisma.task.count({
      where: {
        ownerId: userId,
        dueDate: { gte: todayStart, lt: tomorrowStart },
        status: { not: "DONE" },
      },
    }),
    prisma.reminder.count({
      where: {
        ownerId: userId,
        dueAt: { gte: now, lte: sevenDaysOut },
        isCompleted: false,
      },
    }),
    prisma.habitEntry.count({
      where: {
        ownerId: userId,
        completed: true,
        date: { gte: todayStart, lt: tomorrowStart },
      },
    }),
    prisma.habit.count({ where: { ownerId: userId, isActive: true } }),
    prisma.gitHubConnection.findUnique({ where: { userId } }),
    prisma.gitHubActivity.count({
      where: {
        userId,
        occurredAt: { gte: addUtcDays(todayStart, -7), lte: now },
      },
    }),
    prisma.reminder.count({
      where: {
        ownerId: userId,
        dueAt: { lt: now },
        isCompleted: false,
      },
    }),
  ]);

  return {
    activeProjects,
    dueTodayTasks,
    upcomingReminders,
    overdueReminders,
    habits: {
      active: activeHabits,
      completedToday: completedHabitsToday,
    },
    github: {
      connected: Boolean(githubConnection),
      username: githubConnection?.username || null,
      eventsLast7Days: githubEvents7d,
      lastSyncedAt: githubConnection?.lastSyncedAt || null,
    },
    generatedAt: now.toISOString(),
    timezone: "UTC",
  };
}

async function getProductivityScore(userId, from, to) {
  const range = clampDateRange(from, to);
  const [completedTasks, totalTasks, completedHabits, totalHabitEntries, completedReminders, totalReminders] = await Promise.all([
    prisma.task.count({ where: { ownerId: userId, status: "DONE", updatedAt: { gte: range.from, lte: range.to } } }),
    prisma.task.count({ where: { ownerId: userId, createdAt: { lte: range.to } } }),
    prisma.habitEntry.count({ where: { ownerId: userId, completed: true, date: { gte: range.from, lte: range.to } } }),
    prisma.habitEntry.count({ where: { ownerId: userId, date: { gte: range.from, lte: range.to } } }),
    prisma.reminder.count({ where: { ownerId: userId, isCompleted: true, updatedAt: { gte: range.from, lte: range.to } } }),
    prisma.reminder.count({ where: { ownerId: userId, dueAt: { gte: range.from, lte: range.to } } }),
  ]);

  const taskRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const habitRatio = totalHabitEntries > 0 ? completedHabits / totalHabitEntries : 0;
  const reminderRatio = totalReminders > 0 ? completedReminders / totalReminders : 0;

  const weighted = taskRatio * 0.5 + habitRatio * 0.3 + reminderRatio * 0.2;

  return {
    score: Math.round(weighted * 100),
    breakdown: {
      tasks: { completed: completedTasks, total: totalTasks, weight: 0.5 },
      habits: { completed: completedHabits, total: totalHabitEntries, weight: 0.3 },
      reminders: { completed: completedReminders, total: totalReminders, weight: 0.2 },
    },
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    timezone: "UTC",
  };
}

async function getWeeklyProgress(userId, weeks) {
  const now = new Date();
  const start = startOfUtcDay(addUtcDays(now, -(weeks * 7 - 1)));

  const [tasks, habits, reminders, github] = await Promise.all([
    prisma.task.findMany({
      where: { ownerId: userId, status: "DONE", updatedAt: { gte: start, lte: now } },
      select: { updatedAt: true },
    }),
    prisma.habitEntry.findMany({
      where: { ownerId: userId, completed: true, date: { gte: start, lte: now } },
      select: { date: true },
    }),
    prisma.reminder.findMany({
      where: { ownerId: userId, isCompleted: true, updatedAt: { gte: start, lte: now } },
      select: { updatedAt: true },
    }),
    prisma.gitHubActivity.findMany({
      where: { userId, occurredAt: { gte: start, lte: now } },
      select: { occurredAt: true },
    }),
  ]);

  const buckets = [];
  for (let i = 0; i < weeks; i += 1) {
    const weekStart = addUtcDays(start, i * 7);
    const weekEnd = addUtcDays(weekStart, 7);
    buckets.push({
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      tasksCompleted: 0,
      habitsCompleted: 0,
      remindersCompleted: 0,
      githubEvents: 0,
    });
  }

  function addToBucket(date, key) {
    const diffDays = Math.floor((startOfUtcDay(date) - start) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return;
    const idx = Math.floor(diffDays / 7);
    if (idx >= 0 && idx < buckets.length) {
      buckets[idx][key] += 1;
    }
  }

  tasks.forEach((item) => addToBucket(item.updatedAt, "tasksCompleted"));
  habits.forEach((item) => addToBucket(item.date, "habitsCompleted"));
  reminders.forEach((item) => addToBucket(item.updatedAt, "remindersCompleted"));
  github.forEach((item) => addToBucket(item.occurredAt, "githubEvents"));

  return {
    weeks,
    timezone: "UTC",
    items: buckets,
  };
}

async function getHeatmap(userId, days) {
  const now = new Date();
  const start = startOfUtcDay(addUtcDays(now, -(days - 1)));

  const [tasks, habits, github] = await Promise.all([
    prisma.task.findMany({
      where: { ownerId: userId, status: "DONE", updatedAt: { gte: start, lte: now } },
      select: { updatedAt: true },
    }),
    prisma.habitEntry.findMany({
      where: { ownerId: userId, completed: true, date: { gte: start, lte: now } },
      select: { date: true },
    }),
    prisma.gitHubActivity.findMany({
      where: { userId, occurredAt: { gte: start, lte: now } },
      select: { occurredAt: true },
    }),
  ]);

  const map = new Map();
  for (let i = 0; i < days; i += 1) {
    const d = addUtcDays(start, i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { date: key, count: 0 });
  }

  function bump(date) {
    const key = startOfUtcDay(date).toISOString().slice(0, 10);
    const item = map.get(key);
    if (item) item.count += 1;
  }

  tasks.forEach((item) => bump(item.updatedAt));
  habits.forEach((item) => bump(item.date));
  github.forEach((item) => bump(item.occurredAt));

  return {
    days,
    timezone: "UTC",
    items: Array.from(map.values()),
  };
}

module.exports = {
  getDashboardOverview,
  getProductivityScore,
  getWeeklyProgress,
  getHeatmap,
};
