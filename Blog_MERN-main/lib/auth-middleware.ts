import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import connectDB from "./db"
import User from "@/models/user"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function authMiddleware(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string }

    await connectDB()

    // Get user from database
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Return user object
    return {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }
}
