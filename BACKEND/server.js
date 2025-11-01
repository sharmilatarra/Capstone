const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/codingtracker_msd";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- User Schema ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

// --- Platform Schema Factory ---
function createPlatformModel(platform) {
  const schema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    username: { type: String, required: true },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
  });
  return mongoose.model(platform, schema);
}

// --- Platform Models ---
const Leetcode = createPlatformModel("Leetcode");
const Codeforces = createPlatformModel("Codeforces");
const Hackerrank = createPlatformModel("Hackerrank");
const Codechef = createPlatformModel("Codechef");

// --- JWT Middleware ---
function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });
    req.user = jwt.verify(token, "sectionA");
    console.log("✅ Token verified for user:", req.user.username);
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(401).json({ message: "Invalid token", error: err.message });
  }
}

// --- Register ---
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(400).json({ message: "User exists" });

    const user = await User.create({ username, email, password });
    res.status(201).json({ message: "Registered", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Register failed" });
  }
});

// --- Login ---
app.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!user || user.password !== password) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, username: user.username }, "sectionA", { expiresIn: "24h" });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// --- Platform Routes ---
function platformRoutes(path, Model) {
  // GET stats
  app.get(path, verifyToken, async (req, res) => {
    try {
      const stats = await Model.findOne({ userId: req.user.id });
      if (!stats) return res.json({ username: req.user.username, easySolved: 0, mediumSolved: 0, hardSolved: 0, totalSolved: 0 });
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Fetch error" });
    }
  });

  // POST stats
  app.post(path, verifyToken, async (req, res) => {
    try {
      console.log(`📝 Saving to ${path}:`, req.body);
      console.log("👤 User:", req.user);
      
      const { username, easySolved = 0, mediumSolved = 0, hardSolved = 0 } = req.body;
      const totalSolved = Number(easySolved) + Number(mediumSolved) + Number(hardSolved);

      const stats = await Model.findOneAndUpdate(
        { userId: req.user.id },
        { username, easySolved, mediumSolved, hardSolved, totalSolved, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      console.log("✅ Stats saved:", stats);
      res.json(stats);
    } catch (err) {
      console.error("❌ Save error:", err);
      res.status(500).json({ message: "Save error", error: err.message });
    }
  });
}

// --- Apply Platform Routes ---
platformRoutes("/leetcode", Leetcode);
platformRoutes("/codeforces", Codeforces);
platformRoutes("/hackerrank", Hackerrank);
platformRoutes("/codechef", Codechef);

// --- Start Server ---
app.listen(3030, () => console.log("🚀 Server running on port 3030"));
