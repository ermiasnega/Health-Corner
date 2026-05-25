const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Follow = require("../models/Follow");

// helper — extract hashtags from content
const extractHashtags = (text) => {
  const matches = text.match(/#\w+/g);
  return matches ? matches.map((h) => h.toLowerCase()) : [];
};

// CREATE POST
// Screen P1+P2 — "Post" button
const createPost = async (req, res) => {
  try {
    const {
      title, content, mediaType, mediaUrl,
      category, visibility, isDraft,
    } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const hashtags = extractHashtags(content);

    const post = await Post.create({
      author: req.user._id,
      title,
      content,
      mediaType: mediaType || "none",
      mediaUrl,
      hashtags,
      category: category || "General",
      visibility: visibility || "Everyone",
      isDraft: isDraft || false,
    });

    await post.populate("author", "fullName profileImage bio");
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET FEED
// Home screen — All / Nutrition / Activity / Sleep tabs
const getFeed = async (req, res) => {
  try {
    const filter = { isDraft: false, visibility: "Everyone" };

    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // pagination
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const posts = await Post.find(filter)
      .populate("author", "fullName profileImage bio")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // add isLiked + isBookmarked flags for the requesting user
    const enriched = posts.map((p) => {
      const post = p.toObject();
      post.isLiked      = p.likes.some((id) => id.equals(req.user._id));
      post.isBookmarked = p.bookmarks.some((id) => id.equals(req.user._id));
      post.likeCount    = p.likes.length;
      post.bookmarkCount = p.bookmarks.length;
      return post;
    });

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE POST
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "fullName profileImage bio");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const result = post.toObject();
    result.isLiked      = post.likes.some((id) => id.equals(req.user._id));
    result.isBookmarked = post.bookmarks.some((id) => id.equals(req.user._id));
    result.likeCount    = post.likes.length;

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY POSTS (profile screen — Posts tab)
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE POST
const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // also delete all comments on this post
    await Comment.deleteMany({ post: req.params.id });

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LIKE / UNLIKE POST
// Home screen — ❤️ button
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.some((id) => id.equals(req.user._id));

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => !id.equals(req.user._id));
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.status(200).json({
      liked: !alreadyLiked,
      likeCount: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// BOOKMARK / UNBOOKMARK POST
// Home screen — 🔖 button
const toggleBookmark = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyBookmarked = post.bookmarks.some((id) => id.equals(req.user._id));

    if (alreadyBookmarked) {
      post.bookmarks = post.bookmarks.filter((id) => !id.equals(req.user._id));
    } else {
      post.bookmarks.push(req.user._id);
    }

    await post.save();
    res.status(200).json({
      bookmarked: !alreadyBookmarked,
      bookmarkCount: post.bookmarks.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET BOOKMARKED POSTS
// Profile screen — Saved tab
const getBookmarkedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ bookmarks: req.user._id })
      .populate("author", "fullName profileImage")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD COMMENT
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      post: req.params.id,
      author: req.user._id,
      content,
    });

    // update comment count on post
    post.commentCount += 1;
    await post.save();

    await comment.populate("author", "fullName profileImage");
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET COMMENTS
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("author", "fullName profileImage")
      .sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost, getFeed, getPost, getMyPosts,
  deletePost, toggleLike, toggleBookmark,
  getBookmarkedPosts, addComment, getComments,
};