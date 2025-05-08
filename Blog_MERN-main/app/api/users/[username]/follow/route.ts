import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/user"
import { authMiddleware } from "@/lib/auth-middleware"

export async function POST(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const authResult = await authMiddleware(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    await connectDB()

    // Find the user to follow
    const userToFollow = await User.findOne({ username: params.username })

    if (!userToFollow) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Cannot follow yourself
    if (userToFollow._id.toString() === authResult.user.id) {
      return NextResponse.json({ message: "You cannot follow yourself" }, { status: 400 })
    }

    // Find the current user
    const currentUser = await User.findById(authResult.user.id)

    if (!currentUser) {
      return NextResponse.json({ message: "Current user not found" }, { status: 404 })
    }

    // Check if already following
    const isFollowing = currentUser.following.includes(userToFollow._id)

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter((id) => id.toString() !== userToFollow._id.toString())
      userToFollow.followers = userToFollow.followers.filter((id) => id.toString() !== currentUser._id.toString())
    } else {
      // Follow
      currentUser.following.push(userToFollow._id)
      userToFollow.followers.push(currentUser._id)
    }

    await Promise.all([currentUser.save(), userToFollow.save()])

    return NextResponse.json({
      message: isFollowing ? "User unfollowed" : "User followed",
      following: !isFollowing,
      followersCount: userToFollow.followers.length,
    })
  } catch (error) {
    console.error("Error following/unfollowing user:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
