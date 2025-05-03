import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaTrash } from "react-icons/fa";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreateBlog.css";

interface BlogData {
  title: string;
  shortDescription: string;
  coverImage: string | null;
  description: string;
  category: string;
  user?: {
    clerkId: string;
    name: string;
    email: string;
    profileImage: string;
  };
}

const CreateBlog: React.FC = () => {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [blogId, setBlogId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "",
  }) as Editor | null;

  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const setEditorContent = useCallback((content: string) => {
    if (!editor) {
      const timer = setTimeout(() => setEditorContent(content), 100);
      return () => clearTimeout(timer);
    }
    editor.commands.setContent(content);
  }, [editor]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const editId = queryParams.get('edit');
    
    if (editId) {
      setIsEditMode(true);
      setBlogId(editId);
      fetchBlogForEdit(editId);
    }
  }, [location.search]);

  const fetchBlogForEdit = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/blogs/${id}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const blog = await res.json();
      
      setTitle(blog.title);
      setShortDescription(blog.shortDescription);
      setCategory(blog.category);
      setCoverImage(blog.coverImage);
      setEditorContent(blog.description || '');
    } catch (err) {
      console.error("Error fetching blog for edit:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Failed to load blog for editing"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCoverImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => setCoverImage(null);

  const handleSubmit = async () => {
    if (!user) {
      alert("You must be logged in to publish a blog.");
      return;
    }

    if (!title.trim() || !shortDescription.trim() || !category || !editor?.getText().trim()) {
      setError("Please fill in all fields");
      return;
    }

    const content = editor?.getHTML() || '';

    const blogData: BlogData = {
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      coverImage,
      description: content,
      category,
    };

    try {
      setLoading(true);
      setError("");

      const url = isEditMode 
        ? `http://localhost:5000/api/blogs/${blogId}`
        : "http://localhost:5000/api/blogs/create";
      
      const method = isEditMode ? "PUT" : "POST";
      
      const fullBlogData = isEditMode 
        ? blogData 
        : { 
            ...blogData, 
            user: {
              clerkId: user.id,
              name: user.fullName || "Unknown",
              email: user.primaryEmailAddress?.emailAddress || "No email",
              profileImage: user.imageUrl,
            }
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullBlogData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save blog");
      }

      alert(`✅ Blog ${isEditMode ? 'updated' : 'published'} successfully!`);
      
      if (isEditMode) {
        navigate(`/blog/${blogId}`);
      } else {
        setCoverImage(null);
        setTitle("");
        setShortDescription("");
        setEditorContent("");
        setCategory("");
        navigate("/my-blogs");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="create-blog-container">
      <h1>{isEditMode ? "Edit Blog" : "Create New Blog"}</h1>
      
      {error && <div className="error-message">{error}</div>}

      <div className="cover-image-section">
        {coverImage ? (
          <div className="cover-preview-container">
            <img src={coverImage} alt="Cover" className="cover-preview" />
            <span className="delete-icon" onClick={handleRemoveImage}>
              <FaTrash size={18} />
            </span>
          </div>
        ) : (
          <label className="cover-upload">
            Click to Upload Cover Image
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="file-input"
            />
          </label>
        )}
      </div>

      <div className="title-category-section">
        <input
          type="text"
          className="title-input"
          placeholder="Enter blog title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="description-input"
          placeholder="Write a short description..."
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          rows={3}
        />
        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Technology">Technology</option>
          <option value="Design">Design</option>
          <option value="Business">Business</option>
          <option value="Nature">Nature</option>
          <option value="Health">Health</option>
          <option value="Food">Food</option>
        </select>
      </div>

      <div className="formatting-toolbar">
        <button 
          onClick={() => editor?.chain().focus().toggleBold().run()} 
          className={editor?.isActive("bold") ? "active-format" : ""}
          aria-label="Bold"
        >
          <FaBold />
        </button>
        <button 
          onClick={() => editor?.chain().focus().toggleItalic().run()} 
          className={editor?.isActive("italic") ? "active-format" : ""}
          aria-label="Italic"
        >
          <FaItalic />
        </button>
        <button 
          onClick={() => editor?.chain().focus().toggleUnderline().run()} 
          className={editor?.isActive("underline") ? "active-format" : ""}
          aria-label="Underline"
        >
          <FaUnderline />
        </button>
        <button 
          onClick={() => editor?.chain().focus().toggleStrike().run()} 
          className={editor?.isActive("strike") ? "active-format" : ""}
          aria-label="Strikethrough"
        >
          <FaStrikethrough />
        </button>
      </div>

      {editor && <EditorContent editor={editor} className="editor" />}

      <div className="button-group">
        <button 
          className="submit-button" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            "Processing..."
          ) : isEditMode ? (
            "Update Blog"
          ) : (
            "Publish Blog"
          )}
        </button>
        <button 
          className="cancel-button"
          onClick={() => navigate(isEditMode ? `/blog/${blogId}` : "/my-blogs")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateBlog;