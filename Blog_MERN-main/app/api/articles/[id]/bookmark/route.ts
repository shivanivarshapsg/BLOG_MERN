import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Article from "@/models/article"
import User from "@/models/user"
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

    const user = await User.findById(authResult.user.id)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if article is already bookmarked
    const isBookmarked = user.bookmarks.includes(article._id)

    if (isBookmarked) {
      // Remove bookmark
      user.bookmarks = user.bookmarks.filter((id) => id.toString() !== article._id.toString())
    } else {
      // Add bookmark
      user.bookmarks.push(article._id)
    }

    await user.save()

    return NextResponse.json({
      message: isBookmarked ? "Article removed from bookmarks" : "Article bookmarked",
      bookmarked: !isBookmarked,
    })
  } catch (error) {
    console.error("Error bookmarking article:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
