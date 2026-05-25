const FoodItem = require("../models/FoodItem");
const axios = require("axios");

// CREATE FOOD ITEM (custom food added to library)
const createFood = async (req, res) => {
  try {
    const {
      name, brand, servingSize, calories,
      protein, carbs, fats, vitamins,
      imageUrl, category, description,
    } = req.body;

    if (!name || !calories) {
      return res.status(400).json({ message: "Name and calories are required" });
    }

    const food = await FoodItem.create({
      name, brand, servingSize, calories,
      protein, carbs, fats, vitamins,
      imageUrl, category, description,
      createdBy: req.user._id,
    });

    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL FOODS
// Screen N2 — browse food library
// Supports: ?search=salmon  ?category=High Protein
const getFoods = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const foods = await FoodItem.find(filter)
      .sort({ isVerified: -1, createdAt: -1 }); // verified foods first

    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE FOOD DETAIL
// Screen N3 — food detail with macros, vitamins, AI insight placeholder
const getFood = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    res.status(200).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE FOOD
const updateFood = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    food.name        = req.body.name        ?? food.name;
    food.brand       = req.body.brand       ?? food.brand;
    food.servingSize = req.body.servingSize ?? food.servingSize;
    food.calories    = req.body.calories    ?? food.calories;
    food.protein     = req.body.protein     ?? food.protein;
    food.carbs       = req.body.carbs       ?? food.carbs;
    food.fats        = req.body.fats        ?? food.fats;
    food.imageUrl    = req.body.imageUrl    ?? food.imageUrl;
    food.category    = req.body.category    ?? food.category;
    food.description = req.body.description ?? food.description;
    food.isVerified  = req.body.isVerified  ?? food.isVerified;

    if (req.body.vitamins) food.vitamins = req.body.vitamins;

    const updated = await food.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE FOOD
const deleteFood = async (req, res) => {
  try {
    const food = await FoodItem.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    res.status(200).json({ message: "Food deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEARCH OPEN FOOD FACTS API
// Screen N2 — search bar with barcode/camera icon
// Pulls live data from Open Food Facts and returns it in our format
const searchOpenFoodFacts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const response = await axios.get(
      `https://world.openfoodfacts.org/cgi/search.pl`,
      {
        params: {
          search_terms: q,
          search_simple: 1,
          action: "process",
          json: 1,
          page_size: 10,
        },
      }
    );

    const products = response.data.products || [];

    // map Open Food Facts format to our FoodItem format
    const mapped = products
      .filter((p) => p.product_name && p.nutriments)
      .map((p) => ({
        name: p.product_name,
        brand: p.brands || "",
        servingSize: p.serving_size || "100g",
        calories: Math.round(p.nutriments["energy-kcal_serving"] || p.nutriments["energy-kcal_100g"] || 0),
        protein: Math.round(p.nutriments["proteins_serving"] || p.nutriments["proteins_100g"] || 0),
        carbs: Math.round(p.nutriments["carbohydrates_serving"] || p.nutriments["carbohydrates_100g"] || 0),
        fats: Math.round(p.nutriments["fat_serving"] || p.nutriments["fat_100g"] || 0),
        imageUrl: p.image_url || "",
        openFoodFactsId: p.id || p.code,
      }));

    res.status(200).json(mapped);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch from Open Food Facts" });
  }
};

// IMPORT FROM OPEN FOOD FACTS — save a result into our food library
const importFromOpenFoodFacts = async (req, res) => {
  try {
    const { openFoodFactsId } = req.body;

    if (!openFoodFactsId) {
      return res.status(400).json({ message: "openFoodFactsId is required" });
    }

    // check if already imported
    const existing = await FoodItem.findOne({ openFoodFactsId });
    if (existing) {
      return res.status(200).json(existing);
    }

    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${openFoodFactsId}.json`
    );

    const p = response.data.product;
    if (!p) {
      return res.status(404).json({ message: "Product not found on Open Food Facts" });
    }

    const food = await FoodItem.create({
      name: p.product_name,
      brand: p.brands || "",
      servingSize: p.serving_size || "100g",
      calories: Math.round(p.nutriments["energy-kcal_serving"] || p.nutriments["energy-kcal_100g"] || 0),
      protein: Math.round(p.nutriments["proteins_serving"] || 0),
      carbs: Math.round(p.nutriments["carbohydrates_serving"] || 0),
      fats: Math.round(p.nutriments["fat_serving"] || 0),
      imageUrl: p.image_url || "",
      openFoodFactsId,
      isVerified: false,
      createdBy: req.user._id,
    });

    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFood,
  getFoods,
  getFood,
  updateFood,
  deleteFood,
  searchOpenFoodFacts,
  importFromOpenFoodFacts,
};