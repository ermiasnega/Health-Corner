const MealLog = require("../models/MealLog");
const FoodItem = require("../models/FoodItem");
const User = require("../models/User");

// LOG A MEAL
// Screen N1 — tap + on a meal type to log
const logMeal = async (req, res) => {
  try {
    const {
      foodItem: foodItemId, foodName, mealType,
      servings, notes, date,
    } = req.body;

    if (!mealType) {
      return res.status(400).json({ message: "mealType is required" });
    }

    let calories = req.body.calories;
    let protein  = req.body.protein  || 0;
    let carbs    = req.body.carbs    || 0;
    let fats     = req.body.fats     || 0;

    // if linked to a FoodItem, calculate macros from servings
    if (foodItemId) {
      const food = await FoodItem.findById(foodItemId);
      if (!food) {
        return res.status(404).json({ message: "Food item not found" });
      }
      const multiplier = servings || 1;
      calories = Math.round(food.calories * multiplier);
      protein  = Math.round(food.protein  * multiplier);
      carbs    = Math.round(food.carbs    * multiplier);
      fats     = Math.round(food.fats     * multiplier);
    }

    if (!calories) {
      return res.status(400).json({ message: "calories are required when not linked to a food item" });
    }

    const meal = await MealLog.create({
      user: req.user._id,
      foodItem: foodItemId,
      foodName: foodName || undefined,
      mealType,
      servings: servings || 1,
      calories, protein, carbs, fats,
      notes, date,
    });

    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL MEAL LOGS
const getMeals = async (req, res) => {
  try {
    const meals = await MealLog.find({ user: req.user._id })
      .populate("foodItem", "name imageUrl brand")
      .sort({ date: -1 });

    res.status(200).json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE MEAL LOG
const deleteMeal = async (req, res) => {
  try {
    const meal = await MealLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    res.status(200).json({ message: "Meal deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET DAILY SUMMARY
// Screen N1 — Alex's Summary card + Nutrition Overview + Daily Timeline
const getDailySummary = async (req, res) => {
  try {
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await MealLog.find({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate("foodItem", "name imageUrl");

    const user = await User.findById(req.user._id).select(
      "calorieGoal proteinGoal carbsGoal fatGoal fullName"
    );

    // totals
    const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
    const totalProtein  = meals.reduce((s, m) => s + m.protein, 0);
    const totalCarbs    = meals.reduce((s, m) => s + m.carbs, 0);
    const totalFats     = meals.reduce((s, m) => s + m.fats, 0);

    // Screen N1 — Daily Timeline grouped by meal type
    const timeline = { Breakfast: [], Lunch: [], Dinner: [], Snack: [] };
    meals.forEach((m) => timeline[m.mealType].push(m));

    // Screen N1 — "You're on track for your daily goals"
    const calorieProgress = Math.round((totalCalories / user.calorieGoal) * 100);

    res.status(200).json({
      date: targetDate.toISOString().split("T")[0],
      userName: user.fullName,
      // Screen N1 — summary card
      totalCalories,
      calorieGoal: user.calorieGoal,
      calorieProgress,
      onTrack: calorieProgress <= 110, // within 110% of goal = on track
      // Screen N1 — Nutrition Overview progress bars
      macros: {
        protein: { consumed: totalProtein, goal: user.proteinGoal },
        carbs:   { consumed: totalCarbs,   goal: user.carbsGoal   },
        fats:    { consumed: totalFats,    goal: user.fatGoal     },
      },
      // Screen N1 — Daily Timeline
      timeline,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET WEEKLY SUMMARY
// Screen N4 — calorie bar chart (M T W T F S S) + avg daily calories
const getWeeklySummary = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const meals = await MealLog.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo },
    });

    const user = await User.findById(req.user._id).select(
      "calorieGoal proteinGoal carbsGoal fatGoal"
    );

    const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
    const totalProtein  = meals.reduce((s, m) => s + m.protein, 0);
    const totalCarbs    = meals.reduce((s, m) => s + m.carbs, 0);
    const totalFats     = meals.reduce((s, m) => s + m.fats, 0);

    // Screen N4 — bar chart — calories per day of week
    const caloriesByDay = {};
    meals.forEach((m) => {
      const day = new Date(m.date).toLocaleDateString("en-US", { weekday: "short" });
      caloriesByDay[day] = (caloriesByDay[day] || 0) + m.calories;
    });

    // Screen N4 — goal completion ring
    const avgDailyCalories = Math.round(totalCalories / 7);
    const goalCompletion = Math.min(
      Math.round((avgDailyCalories / user.calorieGoal) * 100),
      100
    );

    res.status(200).json({
      totalCalories,
      avgDailyCalories,
      goalCompletion, // Screen N4 — "86% Weekly Target"
      caloriesByDay,  // Screen N4 — bar chart data
      // Screen N4 — macro targets vs actual
      macros: {
        protein: { consumed: Math.round(totalProtein / 7), goal: user.proteinGoal },
        carbs:   { consumed: Math.round(totalCarbs   / 7), goal: user.carbsGoal   },
        fats:    { consumed: Math.round(totalFats    / 7), goal: user.fatGoal     },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  logMeal,
  getMeals,
  deleteMeal,
  getDailySummary,
  getWeeklySummary,
};