import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // or 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

    return new NextResponse(ip, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error getting IP address:", error);
    return new NextResponse("Internal server error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
