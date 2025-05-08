import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  return NextResponse.json(authResult)
}
