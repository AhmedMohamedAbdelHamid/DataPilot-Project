import type { AiInsightSection, DatasetProfile, DecisionRecommendation } from "@/lib/types";

export class AiUnavailableError extends Error {}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.error === "string") return body.error;
  } catch {
    // fall through to generic message
  }
  return `Request failed with status ${response.status}`;
}

/**
 * Calls POST /api/datapilot/ask. Throws AiUnavailableError if the AI layer
 * isn't configured (503) or the request otherwise fails — callers should
 * catch this and fall back to a deterministic-only message, never surface
 * it as if the whole app were broken.
 */
export async function askGemini(
  question: string,
  profile: DatasetProfile,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const response = await fetch("/api/datapilot/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, profile, history }),
  });

  if (!response.ok) {
    throw new AiUnavailableError(await parseErrorMessage(response));
  }

  const data = await response.json();
  return data.answer as string;
}

/**
 * Calls POST /api/datapilot/explain to generate AI-authored analyst notes
 * grounded in the dataset profile. Throws AiUnavailableError on failure.
 */
export async function explainWithGemini(profile: DatasetProfile): Promise<AiInsightSection[]> {
  const response = await fetch("/api/datapilot/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });

  if (!response.ok) {
    throw new AiUnavailableError(await parseErrorMessage(response));
  }

  const data = await response.json();
  return data.insights as AiInsightSection[];
}

/**
 * Calls POST /api/datapilot/recommend to generate decision-support
 * recommendations — actionable next steps grounded in the profile and the
 * user's approved/rejected cleaning decisions. Throws AiUnavailableError
 * on failure.
 */
export async function generateDecisionSupport(profile: DatasetProfile): Promise<DecisionRecommendation[]> {
  const response = await fetch("/api/datapilot/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });

  if (!response.ok) {
    throw new AiUnavailableError(await parseErrorMessage(response));
  }

  const data = await response.json();
  return data.recommendations as DecisionRecommendation[];
}
