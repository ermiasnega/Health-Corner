const WorkoutLog = require("../models/WorkoutLog");
const User = require("../models/User");

// LOG A COMPLETED WORKOUT SESSION
// Screen A4 — called when user finishes a session
const logWorkout = async (req, res) => {
  try {
    const {
      workout, name, exercisesCompleted,
      duration, caloriesBurned, intensity, date, notes,
    } = req.body;

    if (!duration || !caloriesBurned) {
      return res.status(400).json({
        message: "Duration and caloriesBurned are required",
      });
    }

    const log = await WorkoutLog.create({
      user: req.user._id,
      workout, name, exercisesCompleted,
      duration, caloriesBurned, intensity, date, notes,
    });

    // update streak on the User model
    const user = await User.findById(req.user._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWorkout = user.lastWorkoutDate
      ? new Date(user.lastWorkoutDate)
      : null;

    if (lastWorkout) {
      lastWorkout.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (today - lastWorkout) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        user.streak += 1; // consecutive day — increment streak
      } else if (diffDays > 1) {
        user.streak = 1;  // streak broken — reset to 1
      }
      // diffDays === 0 means already logged today — don't change streak
    } else {
      user.streak = 1; // first ever workout
    }

    user.lastWorkoutDate = new Date();
    await user.save();

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL WORKOUT LOGS FOR USER
const getWorkoutLogs = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ user: req.user._id })
      .populate("workout", "name category imageUrl")
      .sort({ date: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROGRESS SUMMARY
// Screen A3 — Day/Week/Month toggle
const getProgress = async (req, res) => {
  try {
    const period = req.query.period || "week"; // day | week | month

    const now = new Date();
    let startDate = new Date();

    if (period === "day") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "month") {
      startDate.setDate(now.getDate() - 30);
    }

    const logs = await WorkoutLog.find({
      user: req.user._id,
      date: { $gte: startDate },
    }).populate("workout", "name category");

    // Screen A3 — active calories card
    const totalCalories = logs.reduce((sum, l) => sum + l.caloriesBurned, 0);
    const totalDuration = logs.reduce((sum, l) => sum + l.duration, 0);

    // Screen A3 — intensity chart (group by day)
    const intensityByDay = {};
    logs.forEach((l) => {
      const day = new Date(l.date).toLocaleDateString("en-US", { weekday: "short" });
      if (!intensityByDay[day]) {
        intensityByDay[day] = { High: 0, Medium: 0, Low: 0 };
      }
      intensityByDay[day][l.intensity]++;
    });

    // Screen A3 — recent workouts list
    const recentWorkouts = logs.slice(0, 5).map((l) => ({
      id: l._id,
      name: l.workout?.name || l.name,
      date: l.date,
      duration: l.duration,
      caloriesBurned: l.caloriesBurned,
      intensity: l.intensity,
    }));

    res.status(200).json({
      period,
      totalWorkouts: logs.length,
      totalCalories,
      totalDuration,
      avgCaloriesPerWorkout: logs.length
        ? Math.round(totalCalories / logs.length)
        : 0,
      intensityByDay,
      recentWorkouts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET STREAK + WEEKLY GOAL STATUS
// Screen A1 — streak card + "3 of 4 workouts" weekly card
const getStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "streak weeklyWorkoutGoal lastWorkoutDate"
    );

    // count workouts this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const weeklyCount = await WorkoutLog.countDocuments({
      user: req.user._id,
      date: { $gte: weekStart },
    });

    res.status(200).json({
      streak: user.streak,
      lastWorkoutDate: user.lastWorkoutDate,
      weeklyWorkoutGoal: user.weeklyWorkoutGoal,
      weeklyWorkoutsCompleted: weeklyCount,
      // Screen A1 — "75%" weekly progress circle
      weeklyProgress: Math.min(
        Math.round((weeklyCount / user.weeklyWorkoutGoal) * 100),
        100
      ),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE LOG
const deleteWorkoutLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.status(200).json({ message: "Log deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  logWorkout,
  getWorkoutLogs,
  getProgress,
  getStreak,
  deleteWorkoutLog,
};