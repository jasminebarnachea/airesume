import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = readSession(request.cookies.get("careerbridge_session")?.value);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  return NextResponse.json({ user });
}
