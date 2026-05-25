const WaterLog = require("../models/WaterLog");
const User = require("../models/User");

// LOG WATER INTAKE
// Screen N1 — tap + next to "Water 3 / 8 glasses"
const logWater = async (req, res) => {
  try {
    const { glasses, date } = req.body;

    if (glasses === undefined || glasses < 0) {
      return res.status(400).json({ message: "glasses is required and must be 0 or more" });
    }

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // one log per day — update if exists, create if not
    const log = await WaterLog.findOneAndUpdate(
      { user: req.user._id, date: { $gte: startOfDay, $lte: endOfDay } },
      { glasses, date: targetDate },
      { upsert: true, new: true }
    );

    const user = await User.findById(req.user._id).select("waterGoal");

    res.status(200).json({
      glasses: log.glasses,
      // Screen N1 — waterGoal is in ml, 1 glass = ~250ml
      goal: Math.round(user.waterGoal / 250),
      date: log.date,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET TODAY'S WATER INTAKE
// Screen N1 — "Water 3 / 8 glasses"
const getTodayWater = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const log = await WaterLog.findOne({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const user = await User.findById(req.user._id).select("waterGoal");
    const goalGlasses = Math.round(user.waterGoal / 250);

    res.status(200).json({
      glasses: log ? log.glasses : 0,
      goal: goalGlasses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { logWater, getTodayWater };