import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Article from "@/models/article"
import { authMiddleware } from "@/lib/auth-middleware"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid article ID" }, { status: 400 })
    }

    const article = await Article.findById(params.id)
      .select("comments")
      .populate({
        path: "comments.user",
        select: "name username avatar",
      })
      .populate({
        path: "comments.replies.user",
        select: "name username avatar",
      })

    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 })
    }

    return NextResponse.json({
      comments: article.comments,
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authMiddleware(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    await connectDB()

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid article ID" }, { status: 400 })
    }

    const { content } = await request.json()

    if (!content || content.trim() === "") {
      return NextResponse.json({ message: "Comment content is required" }, { status: 400 })
    }

    const article = await Article.findById(params.id)

    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 })
    }

    // Create a new comment
    const newComment = {
      user: authResult.user.id,
      content,
      likes: [],
      replies: [],
    }

    article.comments.push(newComment)
    await article.save()

    // Populate the user information for the new comment
    await Article.populate(article, {
      path: "comments.user",
      select: "name username avatar",
      match: { _id: authResult.user.id },
    })

    // Get the newly added comment
    const addedComment = article.comments[article.comments.length - 1]

    return NextResponse.json(
      {
        message: "Comment added successfully",
        comment: addedComment,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
