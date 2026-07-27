import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { answerQuestionWithGemini, isGeminiConfigured, GeminiError } from "@/lib/gemini";
import type { DatasetProfile } from "@/lib/types";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

interface AskRequestBody {
  question?: string;
  profile?: DatasetProfile;
  history?: { role: "user" | "assistant"; content: string }[];
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return errorResponse("You must be signed in to ask a question.", 401);
  }

  if (!isGeminiConfigured()) {
    // Not an error the caller needs to alarm the user about — the client
    // falls back to the deterministic-only honest fallback message.
    return errorResponse("The AI explanation layer isn't configured (GEMINI_API_KEY missing).", 503);
  }

  let body: AskRequestBody;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Expected a JSON request body.", 400);
  }

  const { question, profile, history } = body;
  if (!question || typeof question !== "string" || !question.trim()) {
    return errorResponse("Missing `question` in the request body.", 400);
  }
  if (!profile) {
    return errorResponse("Missing `profile` in the request body — upload a dataset first.", 400);
  }

  try {
    const answer = await answerQuestionWithGemini(question, profile, history ?? []);
    return NextResponse.json({ answer, source: "ai" as const });
  } catch (err) {
    const message = err instanceof GeminiError ? err.message : "Something went wrong asking the AI layer.";
    return errorResponse(message, 502);
  }
}
