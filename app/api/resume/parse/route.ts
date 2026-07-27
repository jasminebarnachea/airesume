import { NextResponse } from "next/server";
import mammoth from "mammoth";

export const runtime = "nodejs";
export const maxDuration = 60;

type UploadedFile = {
  name: string;
  type?: string;
  size?: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

function isUploadedFile(value: FormDataEntryValue | null): value is FormDataEntryValue & UploadedFile {
  return Boolean(
    value &&
    typeof value !== "string" &&
    typeof (value as UploadedFile).name === "string" &&
    typeof (value as UploadedFile).arrayBuffer === "function",
  );
}

function cleanExtractedText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

const MATCH_STOP_WORDS = new Set([
  "and", "the", "with", "for", "from", "that", "this", "your", "you", "are",
  "job", "office", "description", "requirements", "required", "preferred",
  "school", "work", "role", "years", "experience", "skills", "candidate",
]);

function meaningfulWords(value: string) {
  return Array.from(new Set(
    value.toLowerCase()
      .replace(/[^a-z0-9+#.]+/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 2 && !MATCH_STOP_WORDS.has(word)),
  ));
}

function fallbackAnalysis(resumeText: string, jobDescription: string) {
  const resumeWords = new Set(meaningfulWords(resumeText));
  const sections = jobDescription.split(/(?=^JOB:\s*)/gmi).filter(section => /^JOB:/i.test(section.trim()));
  const jobMatches = sections.map(section => {
    const title = section.match(/^JOB:\s*(.+)$/mi)?.[1]?.trim() || "Available position";
    const requirementText = section.match(/REQUIREMENTS:\s*([\s\S]*)/i)?.[1] || section;
    const requirementWords = meaningfulWords(requirementText);
    const matchedSkills = requirementWords.filter(word => resumeWords.has(word));
    const missingSkills = requirementWords.filter(word => !resumeWords.has(word));
    const evidenceRatio = requirementWords.length ? matchedSkills.length / requirementWords.length : 0;
    const titleWords = meaningfulWords(title);
    const titleRatio = titleWords.length ? titleWords.filter(word => resumeWords.has(word)).length / titleWords.length : 0;
    const skillScore = Math.round(Math.min(100, evidenceRatio * 100));
    const qualificationScore = Math.round(Math.min(100, (evidenceRatio * .7 + titleRatio * .3) * 100));
    const score = Math.round(skillScore * .6 + qualificationScore * .4);
    return { title, score, skillScore, qualificationScore, matchedSkills, missingSkills };
  }).sort((a, b) => b.score - a.score);
  const skills = jobMatches.flatMap(match => match.matchedSkills).filter((skill, index, all) => all.indexOf(skill) === index);
  return {
    summary: "Resume text was extracted successfully. CareerBridge used evidence-based matching while the live AI service was unavailable.",
    skills,
    education: [],
    experience: [],
    qualifications: skills,
    missingSkills: jobMatches[0]?.missingSkills || [],
    interviewSuggestions: ["Ask the applicant to describe practical examples of the matched qualifications."],
    matchScore: jobMatches[0]?.score || 0,
    recommendedOffice: "",
    jobMatches,
    analysisMode: "fallback",
  };
}

async function renderScannedPdfPages(buffer: Buffer) {
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
  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  }).promise;
  const pages: string[] = [];
  // Groq vision accepts up to five images. Three resume pages keep the request
  // quick enough for Vercel while covering the normal resume length.
  const pageCount = Math.min(pdf.numPages, 3);
  try {
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const image = canvas.createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const context = image.getContext("2d");
      await page.render({ canvasContext: context as never, viewport }).promise;
      pages.push(image.toDataURL("image/jpeg", 0.72));
      page.cleanup();
    }
  } finally {}
  await pdf.destroy();
  return pages;
}

async function analyzeScannedResume(images: string[], jobDescription: string, key: string) {
  const controller = new AbortController();
  // Rendering has already replaced the CPU-heavy OCR step. Give the vision
  // request enough time to read the page while remaining below the route limit.
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b",
        reasoning_effort: "none",
        temperature: 0.7,
        top_p: 0.8,
        max_completion_tokens: 2048,
        response_format: { type: "json_object" },
        messages: [{
          role: "user",
          content: [
            { type: "text", text: `Read this scanned resume and compare it independently with every supplied job. Return strict JSON with extractedText, summary, skills[], education[], experience[], qualifications[], missingSkills[], interviewSuggestions[], matchScore (0-100), recommendedOffice, and jobMatches[] sorted highest-first. Every job match must contain the exact supplied title, score, skillScore, qualificationScore, matchedSkills[], and missingSkills[]. Use only visible resume evidence.\n\nJOBS:\n${jobDescription.slice(0, 12000)}` },
            ...images.map(image => ({ type: "image_url", image_url: { url: image } })),
          ],
        }],
      }),
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      throw new Error(`Groq vision returned ${response.status}: ${detail}`);
    }
    const data = await response.json();
    const raw = String(data.choices?.[0]?.message?.content || "").trim();
    return JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")) as Record<string, unknown>;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  try {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({
        error: "The upload could not be received. Please select a PDF or DOCX smaller than 4 MB and try again.",
      }, { status: 400 });
    }
    const file = form.get("resume");
    const jobDescription = String(form.get("jobDescription") || "");
    // Multipart files can come from a different JavaScript realm on Vercel.
    // Feature detection accepts the valid upload without relying on `instanceof File`.
    if (!isUploadedFile(file)) return NextResponse.json({ error: "Resume file is required." }, { status: 400 });
    if (Number(file.size || 0) > 4 * 1024 * 1024) {
      return NextResponse.json({
        error: "This resume is larger than the deployed upload limit. Please upload a PDF or DOCX smaller than 4 MB.",
      }, { status: 413 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!buffer.length) return NextResponse.json({ error: "The selected resume is empty. Please choose the file again." }, { status: 400 });
    const lowerName = file.name.toLowerCase();
    const isPdf = lowerName.endsWith(".pdf") || file.type === "application/pdf";
    const isDocx = lowerName.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const hasPdfSignature = buffer.subarray(0, 1024).includes(Buffer.from("%PDF-"));
    const hasZipSignature = buffer[0] === 0x50 && buffer[1] === 0x4b;
    if (isPdf && !hasPdfSignature) {
      return NextResponse.json({ error: "The selected file has a .pdf name but is not a readable PDF. Export it as PDF again, then re-upload it." }, { status: 415 });
    }
    if (isDocx && !hasZipSignature) {
      return NextResponse.json({ error: "The selected file has a .docx name but is not a readable Word document. Save it as DOCX again, then re-upload it." }, { status: 415 });
    }
    const key = process.env.GROQ_API_KEY;
    if (!key) return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
    let resumeText = "";
    let visionParsed: Record<string, unknown> | null = null;
    if (isPdf) {
      const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
      try {
        resumeText = (await pdfParse(buffer)).text;
      } catch (error) {
        console.warn("PDF text extraction failed; attempting OCR fallback:", error);
      }
      if (resumeText.replace(/\s/g, "").length < 40) {
        try {
          const images = await renderScannedPdfPages(buffer);
          visionParsed = await analyzeScannedResume(images, jobDescription, key);
          resumeText = cleanExtractedText(String(visionParsed.extractedText || ""));
        } catch (error) {
          console.error("Scanned PDF vision analysis failed:", error);
          return NextResponse.json({
            error: "This scanned PDF could not be analyzed quickly enough. Export it as a searchable PDF or DOCX and try again.",
          }, { status: 422 });
        }
      }
    } else if (isDocx) {
      try {
        resumeText = (await mammoth.extractRawText({ buffer })).value;
      } catch {
        return NextResponse.json({
          error: "This Word document could not be read. Save it as a standard DOCX or PDF and try again.",
        }, { status: 422 });
      }
    } else {
      return NextResponse.json({ error: "Please upload a PDF or DOCX resume." }, { status: 415 });
    }
    resumeText = cleanExtractedText(resumeText);
    if (resumeText.replace(/\s/g, "").length < 20) {
      return NextResponse.json({
        error: "The resume could not be read after text extraction and OCR. Please upload a clearer PDF or a DOCX file.",
      }, { status: 422 });
    }
    const controller = new AbortController();
    const aiDeadline = setTimeout(() => controller.abort(), 8_000);
    let parsed: Record<string, unknown>;
    if (visionParsed) {
      parsed = visionParsed;
      clearTimeout(aiDeadline);
    } else try {
      const ai = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", temperature: 0.15,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "Parse resumes for school recruitment. Compare the resume independently against every JOB supplied. Return strict JSON containing summary, skills[], education[], experience[], qualifications[], missingSkills[], interviewSuggestions[], matchScore integer 0-100, recommendedOffice, and jobMatches[] sorted highest-first where each match has the exact supplied title, score integer 0-100, skillScore integer 0-100, qualificationScore integer 0-100, matchedSkills[], and missingSkills[]. Base scores only on resume evidence and job requirements. Never infer protected traits." },
            { role: "user", content: `RESUME TEXT:\n${resumeText.slice(0,18000)}\n\nTARGET JOB:\n${jobDescription.slice(0,12000)}` }
          ]
        })
      });
      if (!ai.ok) throw new Error(`Groq returned ${ai.status}`);
      const data = await ai.json();
      const rawContent = String(data.choices?.[0]?.message?.content || "").trim();
      parsed = JSON.parse(rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
    } catch (error) {
      console.warn("Using deterministic resume matching fallback:", error);
      parsed = fallbackAnalysis(resumeText, jobDescription);
    } finally {
      clearTimeout(aiDeadline);
    }
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
