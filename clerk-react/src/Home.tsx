

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

interface Blog {
  _id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  coverImage: string;
  publishedAt: string;
  likes: number;
  user: {
    name: string;
    profileImage: string;
  };
}

const HomePage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [popularBlogs, setPopularBlogs] = useState<Blog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetch("http://localhost:5000/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data);
        const popular = [...data]
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 3);
        setPopularBlogs(popular);
      })
      .catch((err) => console.error("Error fetching blogs:", err));
  }, []);

  const categories = ["All", "Technology", "Design", "Business", "Nature", "Health", "Food"];

  const filteredBlogs = selectedCategory === "All"
    ? blogs
    : blogs.filter((blog) => blog.category === selectedCategory);

  return (
    <div className="homepage">
      <div className="banner">
        <h1>{selectedCategory}</h1>
        <p>
          {selectedCategory === "All"
            ? "Explore blogs across all categories"
            : `Explore the latest in ${selectedCategory}`}
        </p>
      </div>

      <div className="content">
        
        <div className="blog-section">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => (
              <div className="blog-card" key={blog._id}>
                <img src={blog.coverImage} alt="Blog" />
                <div className="blog-info">
                  <h3>{blog.title}</h3>
                  <p>{blog.shortDescription}</p>
                  <button
                    className="read-more"
                    onClick={() => navigate(`/blog/${blog._id}`)}
                  >
                    Read More
                  </button>
                </div>
                <div className="blog-footer-row">
                  <div className="blog-footer-left">
                    <span>❤️ {blog.likes} Likes</span>
                    <span>{new Date(blog.publishedAt).toDateString()}</span>
                  </div>
                  <div className="user-info">
                    <span>{blog.user.name}</span>
                    <img src={blog.user.profileImage} alt="User" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No blogs available.</p>
          )}
        </div>

        
        <aside className="sidebar">
          
          <div className="categories">
            <h2>Categories</h2>
            <ul>
              {categories.map((category) => (
                <li
                  key={category}
                  className={selectedCategory === category ? "active" : ""}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </li>
              ))}
            </ul>
          </div>
          <div className="popular-posts">
            <h2>Popular Posts</h2>
            {popularBlogs.length > 0 ? (
              popularBlogs.map((blog) => (
                <div 
                  className="popular-card" 
                  key={blog._id}
                  onClick={() => navigate(`/blog/${blog._id}`)}
                >
                  <img src={blog.coverImage} alt={blog.title} />
                  <div>
                    <h4>{blog.title}</h4>
                    <p>{new Date(blog.publishedAt).toDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No popular posts yet.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;