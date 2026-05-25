const WeightEntry = require("../models/WeightEntry");
const User = require("../models/User");

// LOG WEIGHT ENTRY
const logWeight = async (req, res) => {
  try {
    const { weight, date } = req.body;

    if (!weight) {
      return res.status(400).json({ message: "weight is required" });
    }

    const entry = await WeightEntry.create({
      user: req.user._id,
      weight,
      date: date || new Date(),
    });

    // also update current weight on user profile
    await User.findByIdAndUpdate(req.user._id, { weight });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET WEIGHT TREND
// Screen N4 — weight trend chart + "-1.2 kg this month"
const getWeightTrend = async (req, res) => {
  try {
    const period = req.query.period || "month"; // week | month
    const days = period === "week" ? 7 : 30;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const entries = await WeightEntry.find({
      user: req.user._id,
      date: { $gte: since },
    }).sort({ date: 1 });

    if (entries.length === 0) {
      return res.status(200).json({ entries: [], change: 0, current: null });
    }

    const current = entries[entries.length - 1].weight;
    const oldest  = entries[0].weight;
    const change  = parseFloat((current - oldest).toFixed(1));

    res.status(200).json({
      entries: entries.map((e) => ({
        weight: e.weight,
        date: e.date,
      })),
      current,          // Screen N4 — "68.4 kg"
      change,           // Screen N4 — "-1.2 kg this month"
      period,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { logWeight, getWeightTrend };