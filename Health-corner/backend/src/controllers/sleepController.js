const SleepLog = require("../models/SleepLog");
const SleepSchedule = require("../models/SleepSchedule");
const User = require("../models/User");

// helper — derive quality label from score
const getQualityLabel = (score) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
};

// ─── SLEEP LOGS ──────────────────────────────────────────────

// LOG A NIGHT OF SLEEP
const logSleep = async (req, res) => {
  try {
    const {
      date, bedTime, wakeTime, duration,
      lightSleep, deepSleep, quality, notes,
    } = req.body;

    if (!bedTime || !wakeTime || !duration) {
      return res.status(400).json({
        message: "bedTime, wakeTime and duration are required",
      });
    }

    const qualityScore = quality ?? null;

    const log = await SleepLog.create({
      user: req.user._id,
      date: date || new Date(),
      bedTime,
      wakeTime,
      duration,
      lightSleep: lightSleep || 0,
      deepSleep: deepSleep || 0,
      quality: qualityScore,
      qualityLabel: qualityScore !== null ? getQualityLabel(qualityScore) : undefined,
      notes,
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL SLEEP LOGS
const getSleepLogs = async (req, res) => {
  try {
    const logs = await SleepLog.find({ user: req.user._id })
      .sort({ date: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE SLEEP LOG
const deleteSleepLog = async (req, res) => {
  try {
    const log = await SleepLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!log) {
      return res.status(404).json({ message: "Sleep log not found" });
    }
    res.status(200).json({ message: "Sleep log deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SLEEP ANALYSIS
// Screen S1 — Day/Week/Month toggle
const getSleepAnalysis = async (req, res) => {
  try {
    const period = req.query.period || "week";
    const days = period === "day" ? 1 : period === "week" ? 7 : 30;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await SleepLog.find({
      user: req.user._id,
      date: { $gte: since },
    }).sort({ date: 1 });

    const user = await User.findById(req.user._id).select("sleepGoal");
    const sleepGoalMinutes = (user.sleepGoal || 8) * 60;

    if (logs.length === 0) {
      return res.status(200).json({
        period,
        averageDuration: 0,
        averageQuality: 0,
        consistency: 0,
        chartData: [],
        sleepGoalMinutes,
      });
    }

    const totalDuration = logs.reduce((s, l) => s + l.duration, 0);
    const avgDuration   = Math.round(totalDuration / logs.length);
    const avgQuality    = logs.filter(l => l.quality).length > 0
      ? Math.round(logs.reduce((s, l) => s + (l.quality || 0), 0) / logs.filter(l => l.quality).length)
      : null;

    // Screen S1 — bar chart data (light + deep per day)
    const chartData = logs.map((l) => ({
      day: new Date(l.date).toLocaleDateString("en-US", { weekday: "short" }),
      date: l.date,
      duration: l.duration,
      lightSleep: l.lightSleep,
      deepSleep: l.deepSleep,
      quality: l.quality,
    }));

    // Screen S1 — consistency: % of nights within 30 min of target bedtime
    // simplified — % of nights that met the sleep goal duration
    const nightsMeetingGoal = logs.filter(
      (l) => l.duration >= sleepGoalMinutes * 0.9
    ).length;
    const consistency = Math.round((nightsMeetingGoal / logs.length) * 100);

    // Screen S1 — "+12m from last week" comparison
    let durationChange = null;
    if (period === "week" && logs.length >= 2) {
      const firstHalf  = logs.slice(0, Math.floor(logs.length / 2));
      const secondHalf = logs.slice(Math.floor(logs.length / 2));
      const firstAvg   = firstHalf.reduce((s, l) => s + l.duration, 0) / firstHalf.length;
      const secondAvg  = secondHalf.reduce((s, l) => s + l.duration, 0) / secondHalf.length;
      durationChange   = Math.round(secondAvg - firstAvg); // minutes
    }

    // Screen S3 — goal progress %
    const goalProgress = Math.min(
      Math.round((avgDuration / sleepGoalMinutes) * 100),
      100
    );

    res.status(200).json({
      period,
      // Screen S1 — "7h 24m" average
      averageDuration: avgDuration,
      averageDurationFormatted: `${Math.floor(avgDuration / 60)}h ${avgDuration % 60}m`,
      durationChange, // minutes vs previous period
      // Screen S1 — quality ring
      averageQuality: avgQuality,
      qualityLabel: avgQuality ? getQualityLabel(avgQuality) : null,
      // Screen S1 — consistency
      consistency,
      // Screen S3 — goal ring
      sleepGoalMinutes,
      goalProgress,
      // Screen S1 — bar chart
      chartData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── SLEEP SCHEDULE ──────────────────────────────────────────

// GET SLEEP SCHEDULE (Screen S2)
const getSchedule = async (req, res) => {
  try {
    let schedule = await SleepSchedule.findOne({ user: req.user._id });

    // auto-create default schedule if none exists
    if (!schedule) {
      schedule = await SleepSchedule.create({ user: req.user._id });
    }

    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE SLEEP SCHEDULE (Screen S2)
const updateSchedule = async (req, res) => {
  try {
    const {
      targetBedTime, targetWakeTime, repeatDays,
      reminderEnabled, reminderMinutesBefore,
      vibrationStrength, sleepSound,
    } = req.body;

    const schedule = await SleepSchedule.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          ...(targetBedTime         !== undefined && { targetBedTime }),
          ...(targetWakeTime        !== undefined && { targetWakeTime }),
          ...(repeatDays            !== undefined && { repeatDays }),
          ...(reminderEnabled       !== undefined && { reminderEnabled }),
          ...(reminderMinutesBefore !== undefined && { reminderMinutesBefore }),
          ...(vibrationStrength     !== undefined && { vibrationStrength }),
          ...(sleepSound            !== undefined && { sleepSound }),
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  logSleep,
  getSleepLogs,
  deleteSleepLog,
  getSleepAnalysis,
  getSchedule,
  updateSchedule,
};