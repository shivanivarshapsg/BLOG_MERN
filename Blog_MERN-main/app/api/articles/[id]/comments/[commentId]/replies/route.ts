import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Article from "@/models/article"
import { authMiddleware } from "@/lib/auth-middleware"
import mongoose from "mongoose"

export async function POST(request: NextRequest, { params }: { params: { id: string; commentId: string } }) {
  try {
    const authResult = await authMiddleware(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    await connectDB()

    // Check if IDs are valid
    if (!mongoose.Types.ObjectId.isValid(params.id) || !mongoose.Types.ObjectId.isValid(params.commentId)) {
      return NextResponse.json({ message: "Invalid article or comment ID" }, { status: 400 })
    }

    const { content } = await request.json()

    if (!content || content.trim() === "") {
      return NextResponse.json({ message: "Reply content is required" }, { status: 400 })
    }

    const article = await Article.findById(params.id)

    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 })
    }

    // Find the comment
    const comment = article.comments.id(params.commentId)

    if (!comment) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 })
    }

    // Create a new reply
    const newReply = {
      user: authResult.user.id,
      content,
      likes: [],
    }

    comment.replies.push(newReply)
    await article.save()

    // Populate the user information for the new reply
    await Article.populate(article, {
      path: "comments.replies.user",
      select: "name username avatar",
      match: { _id: authResult.user.id },
    })

    // Get the newly added reply
    const addedReply = comment.replies[comment.replies.length - 1]

    return NextResponse.json(
      {
        message: "Reply added successfully",
        reply: addedReply,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding reply:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
