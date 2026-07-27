import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { explainFindingsWithGemini, isGeminiConfigured, GeminiError } from "@/lib/gemini";
import type { DatasetProfile } from "@/lib/types";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

interface ExplainRequestBody {
  profile?: DatasetProfile;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return errorResponse("You must be signed in to generate AI explanations.", 401);
  }

  if (!isGeminiConfigured()) {
    return errorResponse("The AI explanation layer isn't configured (GEMINI_API_KEY missing).", 503);
  }

  let body: ExplainRequestBody;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Expected a JSON request body.", 400);
  }

  if (!body.profile) {
    return errorResponse("Missing `profile` in the request body — upload a dataset first.", 400);
  }

  try {
    const insights = await explainFindingsWithGemini(body.profile);
    return NextResponse.json({ insights });
  } catch (err) {
    const message = err instanceof GeminiError ? err.message : "Something went wrong generating AI explanations.";
    return errorResponse(message, 502);
  }
}
