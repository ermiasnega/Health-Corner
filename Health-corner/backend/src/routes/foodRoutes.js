const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createFood, getFoods, getFood, updateFood,
  deleteFood, searchOpenFoodFacts, importFromOpenFoodFacts,
} = require("../controllers/foodController");

const router = express.Router();
router.use(protect);

router.get("/search/openfoodfacts", searchOpenFoodFacts); // GET /api/foods/search/openfoodfacts?q=salmon
router.post("/import/openfoodfacts", importFromOpenFoodFacts); // POST /api/foods/import/openfoodfacts

router.route("/")
  .get(getFoods)    // GET  /api/foods  (?search=salmon  ?category=High Protein)
  .post(createFood); // POST /api/foods

router.route("/:id")
  .get(getFood)        // GET    /api/foods/:id  (Screen N3)
  .put(updateFood)     // PUT    /api/foods/:id
  .delete(deleteFood); // DELETE /api/foods/:id

module.exports = router;