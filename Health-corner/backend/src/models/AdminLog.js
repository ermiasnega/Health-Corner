const mongoose = require("mongoose");

// audit trail of every admin action
const adminLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // what action was taken
    action: {
      type: String,
      enum: [
        "user_suspended",
        "user_activated",
        "user_role_changed",
        "post_removed",
        "post_approved",
        "user_warned",
        "report_resolved",
      ],
      required: true,
    },

    // what it was done to
    targetType: {
      type: String,
      enum: ["User", "Post", "Comment", "Report"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminLog", adminLogSchema);