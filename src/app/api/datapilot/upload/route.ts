import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildDatasetProfile,
  parseCsvText,
  MAX_UPLOAD_BYTES,
  MAX_ROWS,
} from "@/lib/csv-profiler";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  // Belt-and-suspenders: proxy.ts already blocks unauthenticated requests to
  // /upload, but this route is directly reachable via POST regardless of
  // which page linked to it, so it must check for itself too.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return errorResponse("You must be signed in to upload a dataset.", 401);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Couldn't read the upload — send it as multipart/form-data.", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return errorResponse("No file found in the upload. Expected a form field named `file`.", 400);
  }

  if (!/\.(csv|tsv)$/i.test(file.name)) {
    return errorResponse("That doesn't look like a CSV or TSV file. Please choose a .csv or .tsv file.", 400);
  }

  if (file.size === 0) {
    return errorResponse("That file is empty.", 400);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    const limitMb = (MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(0);
    return errorResponse(`This file is too large — the limit is ${limitMb} MB.`, 413);
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    return errorResponse("Couldn't read the file contents.", 400);
  }

  const parsed = parseCsvText(text);

  if (!parsed.meta.fields || parsed.meta.fields.length === 0) {
    return errorResponse(
      "No columns could be detected — the file may be empty or not comma/tab-separated.",
      422
    );
  }

  if (parsed.data.length > MAX_ROWS) {
    return errorResponse(
      `This file has too many rows (${parsed.data.length.toLocaleString()}) — the limit is ${MAX_ROWS.toLocaleString()} rows per upload.`,
      413
    );
  }

  // Papa.parse in non-strict mode can leave row-level parse errors (e.g. a
  // ragged row with too many fields) in `parsed.errors` without throwing —
  // surface anything that isn't just a benign trailing-delimiter warning.
  const seriousErrors = parsed.errors.filter((e) => e.type !== "FieldMismatch");
  if (seriousErrors.length > 0) {
    return errorResponse(`Couldn't parse this file: ${seriousErrors[0].message}`, 422);
  }

  const profile = buildDatasetProfile(file, parsed);

  return NextResponse.json({ profile });
}
