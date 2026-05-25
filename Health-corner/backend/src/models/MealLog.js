const mongoose = require("mongoose");

const mealLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Screen N1 — linked to food library
    // optional — user can log custom food without a FoodItem ref
    foodItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItem",
    },

    // Screen N1 — fallback name if no FoodItem linked
    // e.g "Avocado Toast, Poached Egg"
    foodName: {
      type: String,
      trim: true,
    },

    // Screen N1 — Breakfast / Lunch / Dinner / Snack timeline
    mealType: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
      required: true,
    },

    // multiplier — if servingSize is "170g" and servings is 2, user ate 340g
    servings: {
      type: Number,
      default: 1,
    },

    // stored directly so summary queries don't need to join FoodItem every time
    // these are calculated as: foodItem.macro * servings
    calories: { type: Number, required: true },
    protein:  { type: Number, default: 0 },
    carbs:    { type: Number, default: 0 },
    fats:     { type: Number, default: 0 },

    notes: {
      type: String,
      trim: true,
    },

    // Screen N1 — Daily Timeline groups by this date
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MealLog", mealLogSchema);