import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Article from "@/models/article"
import User from "@/models/user"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || "all" // all, articles, users, tags
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")

    if (!query) {
      return NextResponse.json({ message: "Search query is required" }, { status: 400 })
    }

    const skip = (page - 1) * limit
    const results: any = {}
    let total = 0

    if (type === "all" || type === "articles") {
      // Search articles
      const articles = await Article.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { excerpt: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
        status: "published",
      })
        .sort({ createdAt: -1 })
        .skip(type === "articles" ? skip : 0)
        .limit(type === "articles" ? limit : 5)
        .populate("author", "name username avatar")
        .lean()

      const articlesCount = await Article.countDocuments({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { excerpt: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
        status: "published",
      })

      results.articles = articles.map((article) => ({
        ...article,
        id: article._id,
        _id: undefined,
        likesCount: article.likes.length,
        commentsCount: article.comments.length,
        likes: undefined,
        comments: undefined,
      }))

      if (type === "articles") {
        total = articlesCount
      }
    }

    if (type === "all" || type === "users") {
      // Search users
      const users = await User.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { username: { $regex: query, $options: "i" } },
          { bio: { $regex: query, $options: "i" } },
        ],
      })
        .select("name username avatar bio")
        .sort({ createdAt: -1 })
        .skip(type === "users" ? skip : 0)
        .limit(type === "users" ? limit : 5)
        .lean()

      const usersCount = await User.countDocuments({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { username: { $regex: query, $options: "i" } },
          { bio: { $regex: query, $options: "i" } },
        ],
      })

      results.users = users.map((user) => ({
        ...user,
        id: user._id,
        _id: undefined,
      }))

      if (type === "users") {
        total = usersCount
      }
    }

    if (type === "all" || type === "tags") {
      // Search tags
      const tags = await Article.aggregate([
        { $match: { status: "published" } },
        { $unwind: "$tags" },
        { $match: { tags: { $regex: query, $options: "i" } } },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $skip: type === "tags" ? skip : 0 },
        { $limit: type === "tags" ? limit : 10 },
      ])

      const tagsCount = await Article.aggregate([
        { $match: { status: "published" } },
        { $unwind: "$tags" },
        { $match: { tags: { $regex: query, $options: "i" } } },
        { $group: { _id: "$tags" } },
        { $count: "total" },
      ])

      results.tags = tags.map((tag) => ({
        name: tag._id,
        count: tag.count,
      }))

      if (type === "tags") {
        total = tagsCount.length > 0 ? tagsCount[0].total : 0
      }
    }

    if (type === "all") {
      return NextResponse.json(results)
    } else {
      return NextResponse.json({
        [type]: results[type],
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      })
    }
  } catch (error) {
    console.error("Error searching:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
