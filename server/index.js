const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const blogRoutes = require("./routes/blogRoutes");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/blogs", blogRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profileImage: { type: String }
});

const User = mongoose.model("User", userSchema);

app.post("/api/save-user", async (req, res) => {
  try {
    const { clerkId, name, email, profileImage } = req.body;

    if (!clerkId || !email || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      user = new User({ clerkId, name, email, profileImage });
      await user.save();
      return res.status(201).json({ message: "User saved successfully!", user });
    }

    res.status(200).json({ message: "User already exists!", user });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Server error!" });
  }
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
