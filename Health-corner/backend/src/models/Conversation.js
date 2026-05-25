const mongoose = require("mongoose");

// Messages screen — each row in Recent list = one Conversation
const conversationSchema = new mongoose.Schema(
  {
    // two participants in the conversation
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // Messages screen — last message preview
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    // Messages screen — unread blue dot indicator
    unreadCount: {
      type: Map,
      of: Number, // { userId: unreadCount }
      default: {},
    },

    // Messages screen — pinned conversations section
    pinnedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);