

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./MyBlogs.css";

interface Blog {
  _id: string;
  title: string;
  shortDescription: string;
  coverImage: string;
  publishedAt: string;
  category: string;
}

const MyBlogs = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const fetchMyBlogs = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/blogs/user/${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();
        setBlogs(data);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        setError("Failed to load your blogs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyBlogs();
  }, [user?.id]);

  const handleEdit = (blogId: string) => {
    navigate(`/create-blog?edit=${blogId}`);
  };

  const handleDelete = async (blogId: string) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/blogs/${blogId}`, {
        method: "DELETE"
      });
      
      if (!res.ok) throw new Error("Failed to delete blog");
      
      setBlogs(blogs.filter(blog => blog._id !== blogId));
    } catch (err) {
      console.error("Error deleting blog:", err);
      setError("Failed to delete blog. Please try again.");
    }
  };

  if (loading) return <div className="loading">Loading your blogs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="my-blogs-container">
      <div className="header">
        <h1>My Blogs</h1>
        <button 
          className="create-new-btn"
          onClick={() => navigate("/create-blog")}
        >
          Create New Blog
        </button>
      </div>
      
      {blogs.length === 0 ? (
        <div className="no-blogs">
          <p>You haven't created any blogs yet.</p>
          <button 
            className="create-btn"
            onClick={() => navigate("/create-blog")}
          >
            Create Your First Blog
          </button>
        </div>
      ) : (
        <div className="blogs-grid">
          {blogs.map((blog) => (
            <div className="blog-card" key={blog._id}>
              {blog.coverImage && (
                <img 
                  src={blog.coverImage} 
                  alt={blog.title} 
                  className="blog-image"
                  onClick={() => navigate(`/blog/${blog._id}`)}
                />
              )}
              <div className="blog-content">
                <h3 onClick={() => navigate(`/blog/${blog._id}`)}>{blog.title}</h3>
                <p className="description">{blog.shortDescription}</p>
                <div className="blog-footer">
                  <span className="date">
                    {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className={`category ${blog.category.toLowerCase()}`}>
                    {blog.category}
                  </span>
                </div>
                <div className="blog-actions">
                  <button 
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(blog._id);
                    }}
                    aria-label="Edit blog"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(blog._id);
                    }}
                    aria-label="Delete blog"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBlogs;