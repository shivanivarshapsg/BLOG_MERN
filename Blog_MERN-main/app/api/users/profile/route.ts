import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/user"
import { authMiddleware } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    await connectDB()

    const user = await User.findById(authResult.user.id).select("-password -__v")

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Format the response
    const formattedUser = {
      ...user.toObject(),
      id: user._id,
      _id: undefined,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      bookmarksCount: user.bookmarks.length,
      followers: undefined,
      following: undefined,
      bookmarks: undefined,
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    await connectDB()

    const { name, bio, avatar } = await request.json()

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      authResult.user.id,
      {
        name,
        bio,
        avatar,
      },
      { new: true },
    ).select("-password -__v")

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Format the response
    const formattedUser = {
      ...updatedUser.toObject(),
      id: updatedUser._id,
      _id: undefined,
      followersCount: updatedUser.followers.length,
      followingCount: updatedUser.following.length,
      bookmarksCount: updatedUser.bookmarks.length,
      followers: undefined,
      following: undefined,
      bookmarks: undefined,
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: formattedUser,
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
