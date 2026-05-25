const mongoose = require("mongoose");

const waterLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Screen N1 — "Water 3 / 8 glasses"
    glasses: {
      type: Number,
      required: true,
      min: 0,
    },

    // one document per day per user
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WaterLog", waterLogSchema);