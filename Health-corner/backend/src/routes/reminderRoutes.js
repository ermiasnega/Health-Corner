const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createReminder, getReminders, getReminder,
  updateReminder, toggleReminder, deleteReminder,
} = require("../controllers/reminderController");

const router = express.Router();
router.use(protect);

router.route("/")
  .post(createReminder)  // POST /api/reminders
  .get(getReminders);    // GET  /api/reminders (?day=Wed &category=Medication &sort=priority)

router.patch("/:id/toggle", toggleReminder); // PATCH /api/reminders/:id/toggle (Screen 1 switch)

router.route("/:id")
  .get(getReminder)        // GET    /api/reminders/:id
  .put(updateReminder)     // PUT    /api/reminders/:id
  .delete(deleteReminder); // DELETE /api/reminders/:id

module.exports = router;