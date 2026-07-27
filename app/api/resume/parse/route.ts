import { NextResponse } from "next/server";
import mammoth from "mammoth";

export const runtime = "nodejs";
export const maxDuration = 60;

async function extractScannedPdfText(buffer: Buffer) {
  const canvas = await import("@napi-rs/canvas");
  // pdf.js expects these browser drawing primitives even when it renders in Node.
  Object.assign(globalThis, {
    DOMMatrix: canvas.DOMMatrix,
    ImageData: canvas.ImageData,
    Path2D: canvas.Path2D,
  });
  // Load the worker in-process. A worker URL is unreliable in serverless bundles
  // because Vercel does not expose node_modules through a browser-compatible URL.
  await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { createWorker } = await import("tesseract.js");
  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  }).promise;
  const pages: string[] = [];
  const worker = await createWorker("eng", 1, { logger: () => undefined });
  // Resumes are normally short. This ceiling prevents one upload monopolizing the server.
  const pageCount = Math.min(pdf.numPages, 8);
  try {
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2 });
      const image = canvas.createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const context = image.getContext("2d");
      await page.render({ canvasContext: context as never, viewport }).promise;
      const result = await worker.recognize(image.toBuffer("image/png"));
      if (result.data.text.trim()) pages.push(result.data.text);
      page.cleanup();
    }
  } finally {
    await worker.terminate();
  }
  await pdf.destroy();
  return pages.join("\n\n");
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("resume");
    const jobDescription = String(form.get("jobDescription") || "");
    if (!(file instanceof File)) return NextResponse.json({ error: "Resume file is required." }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    let resumeText = "";
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
      resumeText = (await pdfParse(buffer)).text;
      if (resumeText.replace(/\s/g, "").length < 40) {
        resumeText = await extractScannedPdfText(buffer);
      }
    } else if (file.name.toLowerCase().endsWith(".docx")) {
      resumeText = (await mammoth.extractRawText({ buffer })).value;
    } else {
      return NextResponse.json({ error: "Please upload a PDF or DOCX resume." }, { status: 415 });
    }
    if (resumeText.replace(/\s/g, "").length < 20) {
      return NextResponse.json({
        error: "The resume could not be read after text extraction and OCR. Please upload a clearer PDF or a DOCX file.",
      }, { status: 422 });
    }
    const key = process.env.GROQ_API_KEY;
    if (!key) return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
    const ai = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", temperature: 0.15,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Parse resumes for school recruitment. Compare the resume independently against every JOB supplied. Return strict JSON containing summary, skills[], education[], experience[], qualifications[], missingSkills[], interviewSuggestions[], matchScore integer 0-100, recommendedOffice, and jobMatches[] sorted highest-first where each match has the exact supplied title, score integer 0-100, skillScore integer 0-100, qualificationScore integer 0-100, matchedSkills[], and missingSkills[]. Base scores only on resume evidence and job requirements. Never infer protected traits." },
          { role: "user", content: `RESUME TEXT:\n${resumeText.slice(0,30000)}\n\nTARGET JOB:\n${jobDescription}` }
        ]
      })
    });
    if (!ai.ok) return NextResponse.json({ error: "Groq analysis failed." }, { status: 502 });
    const data = await ai.json();
    const rawContent = String(data.choices?.[0]?.message?.content || "").trim();
    const parsed = JSON.parse(rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
    const strings = (value: unknown): string[] => Array.isArray(value)
      ? value.map(item => typeof item === "string" ? item : item && typeof item === "object"
        ? Object.values(item as Record<string, unknown>).filter(Boolean).join(" — ")
        : String(item)).map(item => item.trim()).filter(Boolean)
      : [];
    const clamp = (value: unknown, fallback = 0) => Math.min(100, Math.max(0, Number.isFinite(Number(value)) ? Math.round(Number(value)) : fallback));
    const jobMatches = Array.isArray(parsed.jobMatches) ? parsed.jobMatches.map((match: Record<string, unknown>) => {
      const matchedSkills = strings(match.matchedSkills);
      const missingSkills = strings(match.missingSkills);
      const measuredSkillScore = matchedSkills.length + missingSkills.length
        ? Math.round(matchedSkills.length / (matchedSkills.length + missingSkills.length) * 100)
        : clamp(match.score);
      const skillScore = clamp(match.skillScore, measuredSkillScore);
      const qualificationScore = clamp(match.qualificationScore, clamp(match.score));
      return {
        ...match,
        title: String(match.title || ""),
        score: clamp(match.score, Math.round(skillScore * .6 + qualificationScore * .4)),
        skillScore,
        qualificationScore,
        matchedSkills,
        missingSkills,
      };
    }).sort((a: { score: number }, b: { score: number }) => b.score - a.score) : [];
    return NextResponse.json({
      ...parsed,
      skills: strings(parsed.skills),
      education: strings(parsed.education),
      experience: strings(parsed.experience),
      qualifications: strings(parsed.qualifications),
      missingSkills: strings(parsed.missingSkills),
      interviewSuggestions: strings(parsed.interviewSuggestions),
      matchScore: clamp(parsed.matchScore, jobMatches[0]?.score || 0),
      jobMatches,
      extractedText: resumeText.slice(0, 30000),
      extractedTextLength: resumeText.length,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown parser error";
    console.error("Resume parsing failed:", detail);
    return NextResponse.json({ error: `Unable to parse this resume: ${detail}` }, { status: 500 });
  }
}
