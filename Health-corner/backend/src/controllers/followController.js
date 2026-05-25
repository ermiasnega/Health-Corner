const Follow = require("../models/Follow");
const User = require("../models/User");

// FOLLOW / UNFOLLOW USER
const toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.userId;

    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: "User not found" });

    const existing = await Follow.findOne({
      follower: req.user._id,
      following: targetId,
    });

    if (existing) {
      await Follow.findByIdAndDelete(existing._id);
      return res.status(200).json({ following: false });
    }

    await Follow.create({ follower: req.user._id, following: targetId });
    res.status(201).json({ following: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER PROFILE WITH FOLLOW COUNTS
// Profile screen — "Following 23 / Followers 10k"
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select(
      "-password -passwordResetToken -passwordResetExpires"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const [followerCount, followingCount, isFollowing] = await Promise.all([
      Follow.countDocuments({ following: userId }),
      Follow.countDocuments({ follower: userId }),
      Follow.findOne({ follower: req.user._id, following: userId }),
    ]);

    res.status(200).json({
      ...user.toObject(),
      followerCount,
      followingCount,
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY FOLLOW COUNTS (for own profile screen)
const getMyFollowCounts = async (req, res) => {
  try {
    const [followerCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: req.user._id }),
      Follow.countDocuments({ follower: req.user._id }),
    ]);

    res.status(200).json({ followerCount, followingCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { toggleFollow, getUserProfile, getMyFollowCounts };