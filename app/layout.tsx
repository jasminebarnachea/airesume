import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";
import "./blue-theme.css";
import "./compact-envelope.css";
import "./envelope-3d.css";
import "./landing.css";
import "./auth-blue.css";
import "./landing-3d.css";
import "./hugeicons-font.css";
import "./overview-dashboard.css";

export const metadata: Metadata = {
  title: "CareerBridge AI — School Recruitment",
  description: "AI-powered resume analysis and applicant management for schools."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
