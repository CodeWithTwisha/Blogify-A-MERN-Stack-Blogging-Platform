

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  userId: String,
  name: String,
  profileImage: String,
  text: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const blogSchema = new mongoose.Schema({
  user: {
    clerkId: String,
    name: String,
    email: String,
    profileImage: String,
  },
  title: {
    type: String,
    index: true
  },
  shortDescription: {
    type: String,
    index: true
  },
  coverImage: String,
  description: {
    type: String,
    index: true
  },
  category: {
    type: String,
    index: true
  },
  publishedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  likes: {
    type: Number,
    default: 0,
    index: true
  },
  likedBy: [String],
  comments: [commentSchema],
});

blogSchema.index({
  title: 'text',
  shortDescription: 'text',
  description: 'text'
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;