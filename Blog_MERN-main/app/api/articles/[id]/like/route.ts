import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Article from "@/models/article"
import { authMiddleware } from "@/lib/auth-middleware"
import mongoose from "mongoose"

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

    const article = await Article.findById(params.id)

    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 })
    }

    // Check if user already liked the article
    const alreadyLiked = article.likes.includes(authResult.user.id)

    if (alreadyLiked) {
      // Unlike the article
      article.likes = article.likes.filter((id) => id.toString() !== authResult.user.id)
    } else {
      // Like the article
      article.likes.push(authResult.user.id)
    }

    await article.save()

    return NextResponse.json({
      message: alreadyLiked ? "Article unliked" : "Article liked",
      liked: !alreadyLiked,
      likesCount: article.likes.length,
    })
  } catch (error) {
    console.error("Error liking/unliking article:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
