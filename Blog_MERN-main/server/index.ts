import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import mongoose from "mongoose"
import path from "path"

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from "./routes/auth"
import articleRoutes from "./routes/articles"
import userRoutes from "./routes/users"
import searchRoutes from "./routes/search"
import tagRoutes from "./routes/tags"
import uploadRoutes from "./routes/upload"

// Initialize express app
const app = express()
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/articles", articleRoutes)
app.use("/api/users", userRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/tags", tagRoutes)
app.use("/api/upload", uploadRoutes)

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  })
