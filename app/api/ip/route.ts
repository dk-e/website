import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // or 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-real-ip") || req.ip;

    if (!ip) {
      console.error("Could not determine IP address.");
      return NextResponse.json(
        { error: "Could not determine IP address" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ip });
  } catch (error) {
    console.error("Error getting IP address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
