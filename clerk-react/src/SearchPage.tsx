

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularBlogs, setPopularBlogs] = useState<Blog[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q');
    if (query) {
      fetch(`http://localhost:5000/api/blogs/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setBlogs(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error searching blogs:", err);
          setLoading(false);
        });
    }

    fetch("http://localhost:5000/api/blogs/popular")
      .then((res) => res.json())
      .then((data) => {
        setPopularBlogs(data);
        setLoadingPopular(false);
      })
      .catch((err) => {
        console.error("Error fetching popular blogs:", err);
        setLoadingPopular(false);
      });
  }, [location.search]);

  if (loading) return <div className="homepage">Loading...</div>;

  return (
    <div className="homepage">
      <div className="banner">
        <h1>Search Results</h1>
        <p>Blogs matching your search query</p>
      </div>

      <div className="content">
        <div className="blog-section">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
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
            <p>No blogs found matching your search.</p>
          )}
        </div>

        <aside className="sidebar">
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

export default SearchPage;