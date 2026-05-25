const User = require("../models/User");
const bcrypt = require("bcrypt");

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -passwordResetToken -passwordResetExpires");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Basic profile
    user.fullName     = req.body.fullName     ?? user.fullName;
    user.bio          = req.body.bio          ?? user.bio;
    user.profileImage = req.body.profileImage ?? user.profileImage;

    // Basic health
    user.age          = req.body.age          ?? user.age;
    user.gender       = req.body.gender       ?? user.gender;
    user.height       = req.body.height       ?? user.height;
    user.weight       = req.body.weight       ?? user.weight;
    user.activityLevel = req.body.activityLevel ?? user.activityLevel;

    // Wellness context
    user.healthConditions = req.body.healthConditions ?? user.healthConditions;
    if (req.body.focusAreas !== undefined) {
      user.focusAreas = req.body.focusAreas;
    }

    // Daily goals
    user.stepGoal          = req.body.stepGoal          ?? user.stepGoal;
    user.waterGoal         = req.body.waterGoal         ?? user.waterGoal;
    user.calorieGoal       = req.body.calorieGoal       ?? user.calorieGoal;
    user.sleepGoal         = req.body.sleepGoal         ?? user.sleepGoal;
    user.proteinGoal       = req.body.proteinGoal       ?? user.proteinGoal;
    user.carbsGoal         = req.body.carbsGoal         ?? user.carbsGoal;
    user.fatGoal           = req.body.fatGoal           ?? user.fatGoal;
    user.weeklyWorkoutGoal = req.body.weeklyWorkoutGoal ?? user.weeklyWorkoutGoal;

    // Preferences
    user.theme         = req.body.theme         ?? user.theme;
    user.language      = req.body.language      ?? user.language;
    user.notifications = req.body.notifications ?? user.notifications;
    user.sound         = req.body.sound         ?? user.sound;

    // Privacy
    user.profileVisibility  = req.body.profileVisibility  ?? user.profileVisibility;
    user.showActivityInFeed = req.body.showActivityInFeed ?? user.showActivityInFeed;
    user.whoCanMessageMe    = req.body.whoCanMessageMe    ?? user.whoCanMessageMe;
    user.shareDataForAI     = req.body.shareDataForAI     ?? user.shareDataForAI;

    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password -passwordResetToken -passwordResetExpires"
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHANGE PASSWORD (from Settings screen)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ACCOUNT (from Settings screen)
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required to delete account" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword, deleteAccount };