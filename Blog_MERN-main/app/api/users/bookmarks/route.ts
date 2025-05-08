import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/user"
import Article from "@/models/article"
import { authMiddleware } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const user = await User.findById(authResult.user.id).select("bookmarks").lean()

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const skip = (page - 1) * limit

    // Get bookmarked articles
    const bookmarkedArticles = await Article.find({
      _id: { $in: user.bookmarks },
      status: "published",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name username avatar")
      .lean()

    const total = user.bookmarks.length

    // Format the response
    const formattedArticles = bookmarkedArticles.map((article) => ({
      ...article,
      id: article._id,
      _id: undefined,
      likesCount: article.likes.length,
      commentsCount: article.comments.length,
      likes: undefined,
      comments: undefined,
    }))

    return NextResponse.json({
      articles: formattedArticles,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
