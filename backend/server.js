const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const userRoutes = require("./routes/user");
const subscriptionRoutes = require("./routes/subscription");

const app = express();
const PORT = process.env.PORT || 5000;

// 🧩 Security middleware
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
  })
);

// 🧩 Allow both local + deployed origins
// 🧩 Allow both local + deployed origins safely (hardcoded list)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://care-companion-healthcare-platform.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow server-to-server or Postman

      if (allowedOrigins.includes(origin.trim())) {
        // ✅ Allowed
        callback(null, true);
      } else {
        // 🚫 Deny quietly (don’t throw errors that block headers)
        console.warn(`🚫 Blocked CORS from: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);


// ✅ Parse incoming JSON safely
app.use(express.json({
  limit: "10mb"
}));
app.use(express.urlencoded({
  extended: true,
  limit: "10mb"
}));

// 🧩 Connect MongoDB (Render uses MONGODB_URI)
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/user", userRoutes);
app.use("/api/subscription", subscriptionRoutes);

// Health check (Render pings this)
app.get("/", (req, res) => res.send("Backend up ✅"));
app.get("/api/health", (req, res) => res.json({
  status: "ok"
}));

// 404 Handler
app.use("*", (req, res) => res.status(404).json({
  success: false,
  message: "Route not found"
}));

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(", ")}`);
});

module.exports = app;