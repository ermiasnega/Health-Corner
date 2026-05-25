const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getConversations, getOrCreateConversation,
  getMessages, sendMessage, togglePin,
} = require("../controllers/messageController");

const router = express.Router();
router.use(protect);

router.get("/", getConversations);                                    // GET /api/messages
router.get("/with/:userId", getOrCreateConversation);                // GET /api/messages/with/:userId
router.get("/:conversationId", getMessages);                         // GET /api/messages/:conversationId
router.post("/:conversationId", sendMessage);                        // POST /api/messages/:conversationId
router.patch("/:conversationId/pin", togglePin);                     // PATCH /api/messages/:conversationId/pin

module.exports = router;