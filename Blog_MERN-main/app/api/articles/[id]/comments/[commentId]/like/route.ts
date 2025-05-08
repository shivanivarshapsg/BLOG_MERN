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

    const article = await Article.findById(params.id)

    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 })
    }

    // Find the comment
    const comment = article.comments.id(params.commentId)

    if (!comment) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 })
    }

    // Check if user already liked the comment
    const alreadyLiked = comment.likes.includes(authResult.user.id)

    if (alreadyLiked) {
      // Unlike the comment
      comment.likes = comment.likes.filter((id) => id.toString() !== authResult.user.id)
    } else {
      // Like the comment
      comment.likes.push(authResult.user.id)
    }

    await article.save()

    return NextResponse.json({
      message: alreadyLiked ? "Comment unliked" : "Comment liked",
      liked: !alreadyLiked,
      likesCount: comment.likes.length,
    })
  } catch (error) {
    console.error("Error liking/unliking comment:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
