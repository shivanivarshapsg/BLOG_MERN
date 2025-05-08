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

    // Increment view count
    await Article.findByIdAndUpdate(params.id, { $inc: { views: 1 } })

    const article = await Article.findById(params.id)
      .populate("author", "name username avatar bio")
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

    // Format the response
    const formattedArticle = {
      ...article.toObject(),
      id: article._id,
      _id: undefined,
      likesCount: article.likes.length,
      likes: undefined,
    }

    return NextResponse.json(formattedArticle)
  } catch (error) {
    console.error("Error fetching article:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { title, content, excerpt, coverImage, tags, status } = await request.json()

    // Find article and check ownership
    const article = await Article.findById(params.id)

    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 })
    }

    // Check if user is the author
    if (article.author.toString() !== authResult.user.id) {
      return NextResponse.json({ message: "Not authorized to update this article" }, { status: 403 })
    }

    // Update article
    const updatedArticle = await Article.findByIdAndUpdate(
      params.id,
      {
        title,
        content,
        excerpt,
        coverImage,
        tags,
        status,
      },
      { new: true },
    ).populate("author", "name username avatar")

    return NextResponse.json({
      message: "Article updated successfully",
      article: {
        ...updatedArticle?.toObject(),
        id: updatedArticle?._id,
      },
    })
  } catch (error) {
    console.error("Error updating article:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Find article and check ownership
    const article = await Article.findById(params.id)

    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 })
    }

    // Check if user is the author
    if (article.author.toString() !== authResult.user.id) {
      return NextResponse.json({ message: "Not authorized to delete this article" }, { status: 403 })
    }

    await Article.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Article deleted successfully" })
  } catch (error) {
    console.error("Error deleting article:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
