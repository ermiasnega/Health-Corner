const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createPost, getFeed, getPost, getMyPosts,
  deletePost, toggleLike, toggleBookmark,
  getBookmarkedPosts, addComment, getComments,
} = require("../controllers/postController");

const router = express.Router();
router.use(protect);

router.get("/bookmarked", getBookmarkedPosts);  // GET /api/posts/bookmarked (Profile Saved tab)
router.get("/my", getMyPosts);                  // GET /api/posts/my (Profile Posts tab)

router.route("/")
  .post(createPost)  // POST /api/posts
  .get(getFeed);     // GET  /api/posts (?category=Nutrition &search=... &page=1)

router.route("/:id")
  .get(getPost)       // GET    /api/posts/:id
  .delete(deletePost); // DELETE /api/posts/:id

router.patch("/:id/like",     toggleLike);      // PATCH /api/posts/:id/like
router.patch("/:id/bookmark", toggleBookmark);  // PATCH /api/posts/:id/bookmark

router.route("/:id/comments")
  .post(addComment)   // POST /api/posts/:id/comments
  .get(getComments);  // GET  /api/posts/:id/comments

module.exports = router;