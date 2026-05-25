const mongoose = require("mongoose");

const weightEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Screen N4 — weight trend chart
    // "68.4 kg" current weight, "-1.2 kg this month" change
    weight: {
      type: Number,
      required: true, // kg
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeightEntry", weightEntrySchema);