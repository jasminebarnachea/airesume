# CareerBridge AI

An AI-based resume analysis and school recruitment dashboard built with Next.js, Groq, and MongoDB.

## Run locally

1. Start MongoDB locally (MongoDB Compass can connect to `mongodb://127.0.0.1:27017`).
2. Copy `.env.example` to `.env.local` and add your Groq API key.
3. Run `npm install`
4. Run `npm run dev`
5. Open `http://localhost:3000`

Use the role switcher in the top-right to preview the Applicant, Office, and Administrator portals.

## Demo accounts

- Administrator: `admin@careerbridge.edu` / `Admin123!`
- Office: `itoffice@careerbridge.edu` / `Office123!`
- Applicant: `applicant@careerbridge.edu` / `Applicant123!`

Authentication uses a signed, HTTP-only session cookie. Replace `AUTH_SECRET` and the
demo account implementation with database-backed users and hashed passwords before
deploying to production.

## Security note

The Groq key is read only by the server-side API route. Never expose it in client components or commit `.env.local`.
