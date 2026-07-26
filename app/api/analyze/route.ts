import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { resumeText, jobDescription = "" } = await request.json();
    if (!resumeText) return NextResponse.json({ error: "Resume text is required." }, { status: 400 });
    const key = process.env.GROQ_API_KEY;
    if (!key) return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
          { role: "system", content: "You are a school recruitment analyst. Return JSON with: summary, skills (array), education (array), experience (array), qualifications (array), missingSkills (array), interviewSuggestions (array), matchScore (0-100 integer), recommendedOffice." },
          { role: "user", content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}` }
        ]
      })
    });
    if (!response.ok) return NextResponse.json({ error: "AI analysis failed." }, { status: 502 });
    const data = await response.json();
    return NextResponse.json(JSON.parse(data.choices[0].message.content));
  } catch {
    return NextResponse.json({ error: "Unable to analyze this resume." }, { status: 500 });
  }
}
