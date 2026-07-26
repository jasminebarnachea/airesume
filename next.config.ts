import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist", "tesseract.js"],
};

export default nextConfig;
