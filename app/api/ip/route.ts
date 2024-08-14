import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ip = request.ip;
  return NextResponse.json({ ip });
}
