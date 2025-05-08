import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/user"
import Article from "@/models/article"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    await connectDB()

    const user = await User.findOne({ username: params.username }).select("-password -__v")

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get user's articles
    const articles = await Article.find({
      author: user._id,
      status: "published",
    })
      .sort({ createdAt: -1 })
      .select("title excerpt coverImage createdAt readTime tags slug")
      .lean()

    // Format the response
    const formattedUser = {
      ...user.toObject(),
      id: user._id,
      _id: undefined,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      followers: undefined,
      following: undefined,
      bookmarks: undefined,
      articles: articles.map((article) => ({
        ...article,
        id: article._id,
        _id: undefined,
      })),
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
