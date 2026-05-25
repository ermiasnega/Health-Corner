const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.route("/profile")
  .get(getProfile)       // GET  /api/users/profile
  .put(updateProfile);   // PUT  /api/users/profile

router.put("/change-password", changePassword);  // PUT /api/users/change-password
router.delete("/delete-account", deleteAccount); // DELETE /api/users/delete-account

module.exports = router;