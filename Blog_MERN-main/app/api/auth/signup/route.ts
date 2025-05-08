import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/user"

export async function POST(request: Request) {
  try {
    await connectDB()

    const { name, username, email, password } = await request.json()

    // Validate input
    if (!name || !username || !email || !password) {
      return NextResponse.json({ message: "Please provide all required fields" }, { status: 400 })
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (userExists) {
      if (userExists.email === email) {
        return NextResponse.json({ message: "Email already in use" }, { status: 400 })
      }
      return NextResponse.json({ message: "Username already taken" }, { status: 400 })
    }

    // Create new user
    const user = await User.create({
      name,
      username,
      email,
      password,
    })

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Server error", error: (error as Error).message }, { status: 500 })
  }
}
