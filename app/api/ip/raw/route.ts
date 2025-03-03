import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // or 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-real-ip") || req.ip;

    if (!ip) {
      console.error("Could not determine IP address.");
      return new NextResponse("Could not determine IP address", {
        status: 500,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

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
