import { NextResponse } from "next/server";
import { authenticate, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email = "", password = "" } = await request.json();
  const user = authenticate(email, password);
  if (!user) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  const response = NextResponse.json({ user });
  response.cookies.set("careerbridge_session", createSession(user), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/"
  });
  return response;
}
