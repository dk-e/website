import type { NextApiRequest } from "next";

export async function GET(request: NextApiRequest) {
  const ip = request.headers["x-forwarded-for"];
  return new Response(JSON.stringify({ ip }));
}
