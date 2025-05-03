import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useClerk } from '@clerk/clerk-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';  
import { useEffect, useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [searchQuery, setSearchQuery] = useState('');

  // Clear search when navigating away from search page
  useEffect(() => {
    const isSearchPage = location.pathname === '/search';
    if (!isSearchPage) {
      setSearchQuery('');
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      saveUser(user);
    }
  }, [user]);

  const saveUser = async (user: any) => {
    const userData = {
      clerkId: user.id,
      name: user.fullName || "Unknown",
      email: user.primaryEmailAddress?.emailAddress || "No email",
      profileImage: user.imageUrl
    };

    try {
      const response = await fetch("http://localhost:5000/api/save-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Failed to save user");
      console.log("✅ User saved successfully");
    } catch (error) {
      console.error("❌ Error saving user:", error);
    }
  };

  const handleBlogClick = () => {
    if (user) {
      navigate("/create-blog");
    } else {
      openSignIn({ redirectUrl: "/create-blog" });
    }
  };

  const handleMyBlogsClick = () => {
    if (user) {
      navigate("/my-blogs");
    } else {
      openSignIn({ redirectUrl: "/my-blogs" });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Blogify</Link>

      <div className="nav-links">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
        <span
          className={`nav-link ${location.pathname === "/create-blog" ? "active" : ""}`}
          onClick={handleBlogClick}
        >
          Create Blog
        </span>
        <span
          className={`nav-link ${location.pathname === "/my-blogs" ? "active" : ""}`}
          onClick={handleMyBlogsClick}
        >
          My Blogs
        </span>
        <Link to="/about" className={location.pathname === "/about" ? "active" : ""}>About</Link>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Search blogs..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          <FaSearch />
        </button>
      </form>

      <div className="auth-buttons">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="signin-btn">Sign In</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}