

import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import HomePage from "./Home";
import CreateBlog from "./CreateBlog";
import BlogPage from "./BlogPage";
import About from "./About";
import MyBlogs from "./MyBlogs";
import SearchPage from "./SearchPage";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-blog" element={<CreateBlog />} />
        <Route path="/blog/:id" element={<BlogPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/my-blogs" element={<MyBlogs />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </>
  );
}
