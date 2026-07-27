import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDecisionSupportWithGemini, isGeminiConfigured, GeminiError } from "@/lib/gemini";
import type { DatasetProfile } from "@/lib/types";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

interface RecommendRequestBody {
  profile?: DatasetProfile;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return errorResponse("You must be signed in to generate decision-support recommendations.", 401);
  }

  if (!isGeminiConfigured()) {
    return errorResponse("The AI recommendation layer isn't configured (GEMINI_API_KEY missing).", 503);
  }

  let body: RecommendRequestBody;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Expected a JSON request body.", 400);
  }

  if (!body.profile) {
    return errorResponse("Missing `profile` in the request body — upload a dataset first.", 400);
  }

  try {
    const recommendations = await generateDecisionSupportWithGemini(body.profile);
    return NextResponse.json({ recommendations });
  } catch (err) {
    const message = err instanceof GeminiError ? err.message : "Something went wrong generating recommendations.";
    return errorResponse(message, 502);
  }
}
