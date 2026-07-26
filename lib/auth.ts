import { createHmac, timingSafeEqual } from "crypto";

export type SessionUser = { name: string; email: string; role: "Applicant" | "Office" | "Administrator"; office?: string };
const secret = process.env.AUTH_SECRET || "careerbridge-local-development-secret-change-in-production";

const accounts: Array<SessionUser & { password: string }> = [
  { name: "System Administrator", email: "admin@careerbridge.edu", password: "Admin123!", role: "Administrator" },
  { name: "HR Office Manager", email: "itoffice@careerbridge.edu", password: "Office123!", role: "Administrator", office: "Human Resources Office" },
  { name: "Jamie Dela Cruz", email: "applicant@careerbridge.edu", password: "Applicant123!", role: "Applicant" }
];

const sign = (value: string) => createHmac("sha256", secret).update(value).digest("base64url");

export function authenticate(email: string, password: string): SessionUser | null {
  const found = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
  if (!found) return null;
  const { password: _password, ...user } = found;
  return user;
}

export function createSession(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify({ user, expires: Date.now() + 1000 * 60 * 60 * 8 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSession(token?: string): SessionUser | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.expires > Date.now() ? data.user : null;
  } catch { return null; }
}
