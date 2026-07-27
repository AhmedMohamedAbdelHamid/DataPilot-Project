"use client";

import { useRouter } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export function NoDatasetState({
  title = "No dataset uploaded yet",
  description = "Upload a CSV or TSV file to see its profile, quality score, chart recommendations, and AI-assisted insights here.",
}: {
  title?: string;
  description?: string;
}) {
  const router = useRouter();
  return (
    <EmptyState
      icon={FileSpreadsheet}
      title={title}
      description={description}
      actionLabel="Upload a dataset"
      onAction={() => router.push("/upload")}
      className="mt-8"
    />
  );
}
