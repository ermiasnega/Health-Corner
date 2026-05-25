const mongoose = require("mongoose");

const sleepLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Screen S1 — bar chart x-axis, grouped by date
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },

    // Screen S2 — bedtime shown on sleep lab ring
    bedTime: {
      type: String, // "10:30 PM"
      required: true,
    },

    // Screen S2 — wake time shown on sleep lab ring
    wakeTime: {
      type: String, // "6:15 AM"
      required: true,
    },

    // Screen S1 + S3 — "7h 42m" total sleep
    duration: {
      type: Number, // total minutes
      required: true,
    },

    // Screen S1 — bar chart splits into light vs deep
    lightSleep: {
      type: Number, // minutes
      default: 0,
    },
    deepSleep: {
      type: Number, // minutes
      default: 0,
    },

    // Screen S1 + S3 — "88 / 100" quality score
    quality: {
      type: Number, // 0–100
      min: 0,
      max: 100,
    },

    // Screen S3 — "Excellent" / "Optimal" / "Poor" badge
    qualityLabel: {
      type: String,
      enum: ["Excellent", "Good", "Fair", "Poor"],
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SleepLog", sleepLogSchema);