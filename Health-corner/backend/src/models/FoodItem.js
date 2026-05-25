const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
    // Screen N2 — food card title
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Screen N2 — "Whole Foods Market" shown under food name
    brand: {
      type: String,
      trim: true,
    },

    // Screen N2 — "350g" shown under brand
    servingSize: {
      type: String,
      trim: true, // e.g "170g", "1 cup", "1 slice"
    },

    // Screen N2 — "450 kcal" badge on food card
    calories: {
      type: Number,
      required: true,
    },

    // Screen N2 & N3 — macros shown per food card
    protein: { type: Number, default: 0 }, // grams
    carbs:   { type: Number, default: 0 }, // grams
    fats:    { type: Number, default: 0 }, // grams

    // Screen N3 — vitamins & minerals section
    vitamins: [
      {
        name:       String, // e.g "Vitamin B12", "Vitamin D", "Omega-3"
        percentDV:  String, // e.g "133% DV", "110% DV", "High"
      },
    ],

    // Screen N2 — food image shown on card
    imageUrl: {
      type: String,
    },

    // Screen N2 — filter tabs: Trending, High Protein, Low Carb
    category: {
      type: String,
      enum: ["Trending", "High Protein", "Low Carb", "Low Fat", "Vegan", "Other"],
      default: "Other",
    },

    // Screen N3 — food description
    description: {
      type: String,
      trim: true,
    },

    // linked to Open Food Facts for data sync
    openFoodFactsId: {
      type: String,
    },

    // admin-verified foods shown first in search
    isVerified: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// text index for Screen N2 search bar
foodItemSchema.index({ name: "text", brand: "text" });

module.exports = mongoose.model("FoodItem", foodItemSchema);