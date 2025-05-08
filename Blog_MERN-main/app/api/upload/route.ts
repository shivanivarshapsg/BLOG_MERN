import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "File size should be less than 5MB" }, { status: 400 })
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "Only image files are allowed" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate a unique filename
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    // Create the uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads")

    try {
      await writeFile(join(uploadDir, fileName), buffer)
    } catch (error) {
      console.error("Error writing file:", error)
      // If directory doesn't exist, create it and try again
      const { mkdir } = await import("fs/promises")
      await mkdir(uploadDir, { recursive: true })
      await writeFile(join(uploadDir, fileName), buffer)
    }

    // Return the URL to the uploaded file
    const url = `/uploads/${fileName}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: "Upload failed" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
