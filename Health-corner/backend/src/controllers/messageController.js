const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

// GET ALL CONVERSATIONS
// Messages screen — Recent list + Pinned section
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "fullName profileImage")
      .sort({ lastMessageAt: -1 });

    // split into pinned and recent
    const pinned = conversations.filter((c) =>
      c.pinnedBy.some((id) => id.equals(req.user._id))
    );
    const recent = conversations.filter(
      (c) => !c.pinnedBy.some((id) => id.equals(req.user._id))
    );

    // add unread count per conversation for this user
    const enriched = (arr) =>
      arr.map((c) => ({
        ...c.toObject(),
        unreadCount: c.unreadCount.get(req.user._id.toString()) || 0,
        otherParticipant: c.participants.find(
          (p) => !p._id.equals(req.user._id)
        ),
      }));

    res.status(200).json({ pinned: enriched(pinned), recent: enriched(recent) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET OR CREATE CONVERSATION WITH A USER
const getOrCreateConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const other = await User.findById(otherUserId);
    if (!other) return res.status(404).json({ message: "User not found" });

    // find existing conversation between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, otherUserId] },
    }).populate("participants", "fullName profileImage");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, otherUserId],
      });
      await conversation.populate("participants", "fullName profileImage");
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MESSAGES IN A CONVERSATION
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate("sender", "fullName profileImage")
      .sort({ createdAt: 1 });

    // mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user._id },
        isRead: false,
      },
      { isRead: true }
    );

    // reset unread count for this user
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEND MESSAGE (REST fallback — real-time handled by socket.io)
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content,
    });

    // update conversation last message
    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();

    // increment unread count for the other participant
    conversation.participants.forEach((participantId) => {
      if (!participantId.equals(req.user._id)) {
        const current = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), current + 1);
      }
    });

    await conversation.save();
    await message.populate("sender", "fullName profileImage");

    // emit via socket.io if available
    const io = req.app.get("io");
    if (io) {
      io.to(conversation._id.toString()).emit("new_message", message);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PIN / UNPIN CONVERSATION
// Messages screen — pinned section
const togglePin = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isPinned = conversation.pinnedBy.some((id) => id.equals(req.user._id));

    if (isPinned) {
      conversation.pinnedBy = conversation.pinnedBy.filter(
        (id) => !id.equals(req.user._id)
      );
    } else {
      conversation.pinnedBy.push(req.user._id);
    }

    await conversation.save();
    res.status(200).json({ pinned: !isPinned });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  togglePin,
};