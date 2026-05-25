const mongoose = require("mongoose");

const sleepScheduleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one schedule per user
    },

    // Screen S2 — ring display "7h 45m" goal
    targetBedTime: {
      type: String, // "10:30 PM"
      default: "10:30 PM",
    },
    targetWakeTime: {
      type: String, // "6:15 AM"
      default: "6:15 AM",
    },

    // Screen S2 — M T W T F S S day selector
    repeatDays: {
      type: [String],
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      default: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },

    // Screen S2 — "Remind me to sleep" toggle
    reminderEnabled: {
      type: Boolean,
      default: true,
    },
    // 30 min before bedtime reminder
    reminderMinutesBefore: {
      type: Number,
      default: 30,
    },

    // Screen S2 — Soft / Moderate / Strong
    vibrationStrength: {
      type: String,
      enum: ["Soft", "Moderate", "Strong"],
      default: "Moderate",
    },

    // Screen S3 — Rain / White Noise / Ocean
    sleepSound: {
      type: String,
      enum: ["Rain", "White Noise", "Ocean", "None"],
      default: "Rain",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SleepSchedule", sleepScheduleSchema);