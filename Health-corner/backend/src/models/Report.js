const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    // who reported it
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // what was reported — post or comment
    contentType: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "contentType",
    },

    // Screen 3 — reason badge shown on flagged item
    reason: {
      type: String,
      enum: [
        "Unverified Medical Advice",
        "Spam / Promotion",
        "Hate Speech",
        "Misinformation",
        "Inappropriate Content",
        "Other",
      ],
      required: true,
    },

    // Screen 3 — "Flagged by Auto-Mod" or user report
    source: {
      type: String,
      enum: ["User", "Auto-Mod"],
      default: "User",
    },

    // Screen 3 — Pending / Removed / Warned / Approved
    status: {
      type: String,
      enum: ["Pending", "Removed", "Warned", "Approved"],
      default: "Pending",
    },

    // admin who resolved it
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: Date,

    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);