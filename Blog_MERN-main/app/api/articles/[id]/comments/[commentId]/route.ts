import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Article from "@/models/article"
import { authMiddleware } from "@/lib/auth-middleware"
import mongoose from "mongoose"

export async function PUT(request: NextRequest, { params }: { params: { id: string; commentId: string } }) {
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
      return NextResponse.json({ message: "Comment content is required" }, { status: 400 })
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

    // Check if user is the comment author
    if (comment.user.toString() !== authResult.user.id) {
      return NextResponse.json({ message: "Not authorized to update this comment" }, { status: 403 })
    }

    // Update the comment
    comment.content = content
    await article.save()

    return NextResponse.json({
      message: "Comment updated successfully",
      comment,
    })
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; commentId: string } }) {
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

    const article = await Article.findById(params.id)

    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 })
    }

    // Find the comment
    const comment = article.comments.id(params.commentId)

    if (!comment) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 })
    }

    // Check if user is the comment author
    if (comment.user.toString() !== authResult.user.id) {
      return NextResponse.json({ message: "Not authorized to delete this comment" }, { status: 403 })
    }

    // Remove the comment
    article.comments.pull({ _id: params.commentId })
    await article.save()

    return NextResponse.json({
      message: "Comment deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
