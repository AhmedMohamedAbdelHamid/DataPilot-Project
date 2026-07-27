import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UploadArea } from "@/components/shared/upload-area";

export default function UploadPage() {
  return (
    <DashboardShell title="Upload Dataset">
      <div className="mx-auto max-w-3xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Upload a dataset</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            Drop in a CSV or TSV file and DataPilot will profile it, detect issues, and generate
            insights automatically.
          </p>
        </div>

        <div className="mt-6">
          <UploadArea />
        </div>
        {/* TODO(backend): once uploads are persisted per-user via Supabase,
            reintroduce a "Recent uploads" list backed by real records —
            not before. */}
      </div>
    </DashboardShell>
  );
}
