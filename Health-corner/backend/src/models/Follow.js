const mongoose = require("mongoose");

// Profile screen — "Following 23 / Followers 10k"
const followSchema = new mongoose.Schema(
  {
    // the user who is following
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // the user being followed
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// prevent duplicate follows
followSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model("Follow", followSchema);