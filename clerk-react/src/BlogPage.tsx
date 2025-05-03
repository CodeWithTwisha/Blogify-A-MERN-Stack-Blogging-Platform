

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import "./BlogPage.css";

interface Blog {
  _id: string;
  title: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  likes: number;
  likedBy?: string[];
  publishedAt: string;
  user: {
    name: string;
    profileImage: string;
  };
  comments: {
    _id: string;
    userId: string;
    name: string;
    profileImage: string;
    text: string;
    date: string;
  }[];
}

interface PopularBlog {
  _id: string;
  title: string;
  coverImage: string;
  publishedAt: string;
}

const BlogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [popularBlogs, setPopularBlogs] = useState<PopularBlog[]>([]);
  const [liked, setLiked] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/blogs/${id}`);
        if (!res.ok) throw new Error("Failed to fetch blog");
        const data = await res.json();
        setBlog(data);
        if (user) {
          setLiked(data.likedBy?.includes(user.id) || false);
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
      }
    };

    const fetchPopularBlogs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/blogs/popular");
        if (!res.ok) throw new Error("Failed to fetch popular blogs");
        const data = await res.json();
        setPopularBlogs(data);
      } catch (err) {
        console.error("Error fetching popular blogs:", err);
      } finally {
        setLoadingPopular(false);
      }
    };

    fetchBlog();
    fetchPopularBlogs();
  }, [id, user]);

  const handleLike = async () => {
    if (!user || !blog) return;

    try {
      const res = await fetch(`http://localhost:5000/api/blogs/${blog._id}/toggle-like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setBlog(prev => prev ? { ...prev, likes: data.likes } : null);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyMessage("Link copied to clipboard!");
    setTimeout(() => setCopyMessage(""), 2000);
  };

  const handleAddComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newComment.trim() === "" || !user || !blog) return;

    const commentData = {
      userId: user.id,
      name: user.fullName || "Anonymous",
      profileImage: user.imageUrl || "/default-user.png",
      text: newComment,
    };

    try {
      const res = await fetch(`http://localhost:5000/api/blogs/${blog._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData),
      });

      const data = await res.json();
      if (res.ok) {
        setBlog(prev => prev ? { ...prev, comments: data.comments } : null);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to send comment", err);
    }
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!user || !blog || editedText.trim() === "") {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/blogs/${blog._id}/comment/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, newText: editedText }),
      });

      const data = await res.json();
      if (res.ok) {
        setBlog(prev => prev ? { ...prev, comments: data.comments } : null);
        setEditingCommentId(null);
      }
    } catch (err) {
      console.error("Failed to update comment", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || !blog) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/blogs/${blog._id}/comment/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();
      if (res.ok) {
        setBlog(prev => prev ? { ...prev, comments: data.comments } : null);
      }
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  if (!blog) return <div className="loading">Loading blog...</div>;

  return (
    <div className="blogpage-container">
      <div className="blog-content">
        <img src={blog.coverImage} alt="Cover" className="blog-cover" />
        <h1 className="blog-title">{blog.title}</h1>
        <p className="blog-description">{blog.shortDescription}</p>

        <div
          className="blog-text"
          dangerouslySetInnerHTML={{ __html: blog.description }}
        />

        <div className="blog-actions-container">
          <button
            className={`blog-action-btn blog-action-like ${liked ? "liked" : ""}`}
            onClick={handleLike}
          >
            {liked ? "❤️" : "🤍"} ({blog.likes})
          </button>
          <button
            className="blog-action-btn blog-action-share"
            onClick={handleShare}
          >
            🔗
          </button>
          {copyMessage && <div className="blog-action-message">{copyMessage}</div>}
        </div>

        <div className="comments-section">
          <h2>Comments ({blog.comments?.length || 0})</h2>
          <div className="comments-list">
            {blog.comments?.length > 0 ? (
              blog.comments.map((comment) => (
                <div className="comment" key={comment._id}>
                  <div className="comment-header">
                    <div className="comment-user-info">
                      <img
                        src={comment.profileImage || "/default-user.png"}
                        alt={comment.name || "User"}
                      />
                      <strong>{comment.name || "Anonymous"}</strong>
                    </div>
                    {user?.id === comment.userId && (
                      <div className="comment-actions">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditedText(comment.text);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  {editingCommentId === comment._id ? (
                    <div className="edit-comment">
                      <input
                        className="edit-comment-input"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        autoFocus
                      />
                      <div className="edit-comment-buttons">
                        <button
                          className="cancel-btn"
                          onClick={() => setEditingCommentId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="save-btn"
                          onClick={() => handleSaveEdit(comment._id)}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="comment-text">{comment.text}</p>
                      <small className="comment-date">
                        {new Date(comment.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </small>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}
          </div>

          {user && (
            <form className="add-comment" onSubmit={handleAddComment}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
              />
              <button type="submit">Post</button>
            </form>
          )}
        </div>
      </div>

      <div className="sidebar">
        <div className="popular-posts">
          <h2>Popular Posts</h2>
          {loadingPopular ? (
            <p>Loading popular posts...</p>
          ) : popularBlogs.length > 0 ? (
            popularBlogs.map((blog) => (
              <div
                className="popular-card"
                key={blog._id}
                onClick={() => navigate(`/blog/${blog._id}`)}
              >
                <img src={blog.coverImage} alt={blog.title} />
                <div>
                  <h4>{blog.title}</h4>
                  <p>
                    {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No popular posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;