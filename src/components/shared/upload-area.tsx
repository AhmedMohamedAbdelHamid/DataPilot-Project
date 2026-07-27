"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileSpreadsheet, CheckCircle2, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabeledProgress } from "@/components/shared/labeled-progress";
import { useDataset } from "@/lib/dataset-store";
import type { DatasetProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

export function UploadArea() {
  const router = useRouter();
  const { setProfile } = useDataset();
  const [state, setState] = React.useState<UploadState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [fileName, setFileName] = React.useState("");
  const [fileSize, setFileSize] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [rowCount, setRowCount] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const beginUpload = async (file: File) => {
    const validExtension = /\.(csv|tsv)$/i.test(file.name);
    if (!validExtension) {
      setErrorMessage("That doesn't look like a CSV or TSV file. Please choose a .csv or .tsv file.");
      setState("error");
      return;
    }

    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    setState("uploading");
    setProgress(8);

    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 88 ? p + Math.random() * 10 + 4 : p));
    }, 180);

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/datapilot/upload", { method: "POST", body });
      const json: { profile?: DatasetProfile; error?: string } = await res.json();

      if (!res.ok || !json.profile) {
        throw new Error(json.error ?? "Something went wrong while processing this file.");
      }

      clearInterval(progressTimer);
      setRowCount(json.profile.summary.rows);
      setProgress(100);
      setProfile(json.profile);
      setTimeout(() => setState("success"), 300);
    } catch (err) {
      clearInterval(progressTimer);
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong while reading this file.");
      setState("error");
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    void beginUpload(files[0]);
  };

  const reset = () => {
    setState("idle");
    setProgress(0);
    setFileName("");
    setErrorMessage("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.tsv,text/csv,text/tab-separated-values"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        aria-hidden="true"
        tabIndex={-1}
      />

      <AnimatePresence mode="wait">
        {(state === "idle" || state === "dragging") && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="button"
            tabIndex={0}
            aria-label="Upload CSV file, drag and drop or press to browse"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setState("dragging");
            }}
            onDragLeave={() => setState("idle")}
            onDrop={(e) => {
              e.preventDefault();
              setState("idle");
              handleFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              state === "dragging"
                ? "border-primary bg-primary/5"
                : "border-border bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50"
            )}
          >
            <motion.div
              animate={state === "dragging" ? { y: -6 } : { y: 0 }}
              className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            >
              <UploadCloud className="size-8" strokeWidth={1.75} />
            </motion.div>
            <p className="mt-5 text-[15px] font-semibold text-foreground">
              Drag & drop your CSV file here
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              or click to browse from your computer
            </p>
            <Button className="mt-5" size="sm" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
              Browse files
            </Button>
            <p className="mt-5 text-[11.5px] text-muted-foreground/70">
              Supported formats: .csv, .tsv &nbsp;·&nbsp; Up to 15 MB &nbsp;·&nbsp; Profiled server-side
            </p>
          </motion.div>
        )}

        {state === "uploading" && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileSpreadsheet className="size-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-foreground">{fileName}</p>
                <p className="text-[12px] text-muted-foreground">{fileSize}</p>
              </div>
              <Button variant="ghost" size="icon" className="size-8" onClick={reset} aria-label="Cancel upload">
                <X className="size-4" />
              </Button>
            </div>
            <LabeledProgress value={progress} label="Reading & profiling your data" className="mt-5" />
          </motion.div>
        )}

        {state === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-foreground">{fileName}</p>
                <p className="text-[12px] text-emerald-700 dark:text-emerald-400">
                  Parsed {rowCount.toLocaleString()} rows · {fileSize}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button className="flex-1" onClick={() => router.push("/analyzing")}>
                Start Analysis
              </Button>
              <Button variant="outline" onClick={reset}>
                Upload a different file
              </Button>
            </div>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-destructive/25 bg-destructive/5 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-foreground">Couldn&apos;t read this file</p>
                <p className="text-[12px] text-destructive">{errorMessage}</p>
              </div>
            </div>
            <Button variant="outline" className="mt-5" onClick={reset}>
              Try again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
