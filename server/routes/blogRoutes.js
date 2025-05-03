
const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");

// Get all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blogs", details: err.message });
  }
});

// Search blogs
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const blogs = await Blog.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { shortDescription: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).sort({ publishedAt: -1 });

    res.status(200).json(blogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to search blogs", details: err.message });
  }
});

// Get popular blogs
router.get("/popular", async (req, res) => {
  try {
    const popularBlogs = await Blog.find()
      .sort({ likes: -1, publishedAt: -1 })
      .limit(3);
    res.status(200).json(popularBlogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch popular blogs", details: err.message });
  }
});

// Get single blog
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blog", details: err.message });
  }
});

// Create blog
router.post("/create", async (req, res) => {
  try {
    const blog = new Blog(req.body);
    const savedBlog = await blog.save();
    res.status(201).json({ message: "Blog saved successfully!", blog: savedBlog });
  } catch (err) {
    res.status(500).json({ error: "Failed to save blog", details: err.message });
  }
});

// Toggle like
router.put("/:id/toggle-like", async (req, res) => {
  const { userId } = req.body;
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const hasLiked = blog.likedBy.includes(userId);
    if (hasLiked) {
      blog.likedBy = blog.likedBy.filter((id) => id !== userId);
      blog.likes -= 1;
    } else {
      blog.likedBy.push(userId);
      blog.likes += 1;
    }

    await blog.save();
    res.status(200).json({ liked: !hasLiked, likes: blog.likes });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle like", details: err.message });
  }
});

// Add comment
router.post("/:id/comment", async (req, res) => {
  const { userId, name, profileImage, text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ error: "Comment text cannot be empty." });
  }

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    blog.comments.push({ userId, name, profileImage, text });
    await blog.save();

    res.status(200).json({ message: "Comment added", comments: blog.comments });
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment", details: err.message });
  }
});

// Edit comment
router.put("/:blogId/comment/:commentId", async (req, res) => {
  const { userId, newText } = req.body;

  if (!newText?.trim()) {
    return res.status(400).json({ error: "Comment text cannot be empty." });
  }

  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.userId !== userId) {
      return res.status(403).json({ error: "You can only edit your own comments." });
    }

    comment.text = newText;
    comment.date = new Date();
    await blog.save();

    res.status(200).json({ message: "Comment updated", comments: blog.comments });
  } catch (err) {
    res.status(500).json({ error: "Failed to edit comment", details: err.message });
  }
});

// Delete comment
router.delete("/:blogId/comment/:commentId", async (req, res) => {
  const { userId } = req.body;

  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.userId !== userId) {
      return res.status(403).json({ error: "You can only delete your own comments." });
    }

    comment.deleteOne(); 
    await blog.save();

    res.status(200).json({ message: "Comment deleted", comments: blog.comments });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment", details: err.message });
  }
});

module.exports = router;

// Get blogs by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const blogs = await Blog.find({ "user.clerkId": req.params.userId })
      .sort({ publishedAt: -1 });
    res.status(200).json(blogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user blogs", details: err.message });
  }
});

// Update blog
router.put("/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ error: "Failed to update blog", details: err.message });
  }
});

// Delete blog
router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete blog", details: err.message });
  }
});

module.exports = router;