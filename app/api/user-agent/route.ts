import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // or 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const agent = req.headers.get("user-agent");

    if (!agent) {
      console.error("Could not determine the user-agent.");
      return NextResponse.json(
        { error: "Could not determine the user-agent" },
        { status: 500 }
      );
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error("Error getting user-agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
