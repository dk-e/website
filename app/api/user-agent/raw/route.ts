import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // or 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const agent = req.headers.get("user-agent");

    if (!agent) {
      console.error("Could not determine the user-agent.");
      return new NextResponse("Could not determine the user-agent", {
        status: 500,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    return new NextResponse(agent, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error getting user-agent:", error);
    return new NextResponse("Internal server error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
