const Reminder = require("../models/Reminder");

// CREATE REMINDER
// Screen 2 — "Create Reminder" button
const createReminder = async (req, res) => {
  try {
    const {
      title, time, category, repeatDays,
      isDaily, isHighPriority, sound, notes,
    } = req.body;

    if (!title || !time) {
      return res.status(400).json({ message: "Title and time are required" });
    }

    const reminder = await Reminder.create({
      user: req.user._id,
      title,
      time,
      category,
      repeatDays,
      isDaily: isDaily ?? true,
      isHighPriority: isHighPriority ?? false,
      sound,
      notes,
    });

    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL REMINDERS
// Screen 1 — full list, supports ?day=Wed for calendar day filter
const getReminders = async (req, res) => {
  try {
    const filter = { user: req.user._id };

    // Screen 1 — calendar strip filter by selected day
    if (req.query.day) {
      filter.repeatDays = req.query.day;
    }

    // Screen 1 — Filter button: ?category=Medication
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Screen 1 — Sort button: ?sort=time (default) or ?sort=priority
    const sortField = req.query.sort === "priority"
      ? { isHighPriority: -1, time: 1 }
      : { time: 1 };

    const reminders = await Reminder.find(filter).sort(sortField);
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE REMINDER
const getReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.status(200).json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE REMINDER
const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    reminder.title          = req.body.title          ?? reminder.title;
    reminder.time           = req.body.time           ?? reminder.time;
    reminder.category       = req.body.category       ?? reminder.category;
    reminder.isEnabled      = req.body.isEnabled      ?? reminder.isEnabled;
    reminder.isHighPriority = req.body.isHighPriority ?? reminder.isHighPriority;
    reminder.sound          = req.body.sound          ?? reminder.sound;
    reminder.notes          = req.body.notes          ?? reminder.notes;
    reminder.isDaily        = req.body.isDaily        ?? reminder.isDaily;

    if (req.body.repeatDays !== undefined) {
      reminder.repeatDays = req.body.repeatDays;
    }

    const updated = await reminder.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE REMINDER ON/OFF
// Screen 1 — toggle switch on each reminder card
const toggleReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    reminder.isEnabled = !reminder.isEnabled;
    await reminder.save();

    res.status(200).json({
      message: `Reminder ${reminder.isEnabled ? "enabled" : "disabled"}`,
      isEnabled: reminder.isEnabled,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE REMINDER
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.status(200).json({ message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  toggleReminder,
  deleteReminder,
};