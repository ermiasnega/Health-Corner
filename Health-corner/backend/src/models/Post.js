const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Screen P2 — "Add a catchy title"
    title: {
      type: String,
      trim: true,
    },

    // Screen P1 — "Share your health journey..."
    content: {
      type: String,
      required: true,
      trim: true,
    },

    // Screen P1 — Photo / Video / Poll / Audio
    mediaType: {
      type: String,
      enum: ["none", "photo", "video", "poll", "audio"],
      default: "none",
    },
    mediaUrl: {
      type: String, // image/video URL
    },

    // Screen P2 — # hashtags parsed from content
    hashtags: {
      type: [String],
      default: [],
    },

    // Home screen — filter tabs: All / Nutrition / Activity / Sleep
    category: {
      type: String,
      enum: ["General", "Nutrition", "Activity", "Sleep", "Wellness"],
      default: "General",
    },

    // Screen P2 — "Everyone can view this post"
    visibility: {
      type: String,
      enum: ["Everyone", "Followers", "Only me"],
      default: "Everyone",
    },

    // Screen P2 — save as draft
    isDraft: {
      type: Boolean,
      default: false,
    },

    // Home screen — ❤️ 1.2k likes
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Home screen — 💬 42 comments count (actual comments in Comment model)
    commentCount: {
      type: Number,
      default: 0,
    },

    // Home screen — 🔖 bookmark
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Home screen — ↗ 12 shares
    shareCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// text index for search
postSchema.index({ content: "text", title: "text", hashtags: "text" });

module.exports = mongoose.model("Post", postSchema);