import mongoose from "mongoose"
import { calculateReadingTime } from "@/lib/calculate-reading-time"

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: [true, "Reply content is required"],
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  },
)

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Please provide content"],
      minlength: [100, "Content must be at least 100 characters long"],
    },
    excerpt: {
      type: String,
      required: [true, "Please provide an excerpt"],
      maxlength: [200, "Excerpt cannot be more than 200 characters"],
    },
    coverImage: {
      type: String,
      default: "",
    },
    readTime: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [commentSchema],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Create slug from title
articleSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")

    // Add a random string to ensure uniqueness
    const randomString = Math.random().toString(36).substring(2, 8)
    this.slug = `${this.slug}-${randomString}`
  }

  // Calculate reading time
  if (this.isModified("content")) {
    this.readTime = calculateReadingTime(this.content)
  }

  next()
})

const Article = mongoose.models.Article || mongoose.model("Article", articleSchema)

export default Article
