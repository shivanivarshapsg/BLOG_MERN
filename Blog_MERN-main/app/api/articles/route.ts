import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Article from "@/models/article"
import { authMiddleware } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const tag = searchParams.get("tag")
    const author = searchParams.get("author")
    const featured = searchParams.get("featured")
    const search = searchParams.get("search")
    const sort = searchParams.get("sort") || "-createdAt" // Default sort by newest

    const query: any = { status: "published" }

    if (tag) {
      query.tags = tag
    }

    if (author) {
      query.author = author
    }

    if (featured === "true") {
      query.featured = true
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit

    const articles = await Article.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("author", "name username avatar")
      .lean()

    const total = await Article.countDocuments(query)

    // Format the response
    const formattedArticles = articles.map((article) => ({
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
    console.error("Error fetching articles:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    await connectDB()

    const { title, content, excerpt, coverImage, tags, status = "published" } = await request.json()

    // Validate input
    if (!title || !content) {
      return NextResponse.json({ message: "Title and content are required" }, { status: 400 })
    }

    // Create excerpt if not provided
    let finalExcerpt = excerpt
    if (!finalExcerpt) {
      // Remove markdown formatting and limit to 150 characters
      finalExcerpt = content
        .replace(/#{1,6}\s?/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/\[(.*?)\]$$(.*?)$$/g, "$1")
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`(.*?)`/g, "$1")
        .replace(/>\s?(.*)/g, "$1")
        .replace(/- (.*)/g, "$1")
        .replace(/\d+\. (.*)/g, "$1")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .trim()

      finalExcerpt = finalExcerpt.length > 150 ? finalExcerpt.substring(0, 150) + "..." : finalExcerpt
    }

    const article = await Article.create({
      title,
      content,
      excerpt: finalExcerpt,
      coverImage,
      tags,
      author: authResult.user.id,
      status,
    })

    await article.populate("author", "name username avatar")

    return NextResponse.json(
      {
        message: "Article created successfully",
        article: {
          ...article.toObject(),
          id: article._id,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating article:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
