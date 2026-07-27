"use client";

import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AiMessageBubble, TypingBubble } from "@/components/shared/ai-message-bubble";
import { NoDatasetState } from "@/components/shared/no-dataset-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { answerFromProfile } from "@/lib/csv-profiler";
import { askGemini, AiUnavailableError } from "@/lib/ai-client";
import { useActiveDataset } from "@/lib/dataset-store";
import type { ChatMessage } from "@/lib/types";
import { Send, Sparkles } from "lucide-react";

const suggestedQuestions = [
  "How many rows and columns are there?",
  "Which columns have missing values?",
  "Are there any duplicate rows?",
  "Which two columns are most correlated?",
  "What are the column types?",
  "What should I look into before using this data for a decision?",
];

const honestFallback =
  "I can answer questions about row/column counts, missing values, duplicates, outliers, correlations, and column types for this dataset — try one of the suggested questions, or rephrase. For open-ended questions I need the AI explanation layer, which isn't reachable right now (it may not be configured, or the request failed) — so I can only answer from what DataPilot computed directly from your file.";

export default function AskAiPage() {
  const { profile } = useActiveDataset();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const nextId = React.useRef(1);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  if (!profile) {
    return (
      <DashboardShell title="Ask AI">
        <NoDatasetState description="Upload a dataset to ask questions about it — row counts, missing values, correlations, and more." />
      </DashboardShell>
    );
  }

  const greeting: ChatMessage = {
    id: "msg-greeting",
    role: "assistant",
    content: `Hi! I've read through ${profile.summary.name} — ${profile.summary.rows.toLocaleString()} rows and ${profile.summary.columns} columns. Ask me anything about the data: trends, outliers, correlations, or what to do next.`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = {
      id: `msg-${nextId.current++}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const historyForGemini = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const pushReply = (content: string, source: ChatMessage["source"]) => {
      const reply: ChatMessage = {
        id: `msg-${nextId.current++}`,
        role: "assistant",
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source,
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    };

    // Deterministic patterns first — instant, no network call, and exactly
    // matches the computed profile. Only fall back to Gemini (grounded in
    // the same profile) for open-ended questions this can't recognize.
    const deterministicAnswer = answerFromProfile(trimmed, profile);
    if (deterministicAnswer) {
      setTimeout(() => pushReply(deterministicAnswer, "deterministic"), 500);
      return;
    }

    try {
      const answer = await askGemini(trimmed, profile, historyForGemini);
      pushReply(answer, "ai");
    } catch (err) {
      const message = err instanceof AiUnavailableError ? err.message : undefined;
      pushReply(honestFallback + (message ? ` (${message})` : ""), "deterministic");
    }
  };

  return (
    <DashboardShell title="Ask AI">
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
        <div className="flex items-center gap-3 pb-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" strokeWidth={1.9} />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold tracking-tight text-foreground">Ask your data</h1>
            <p className="text-[12.5px] text-muted-foreground">{profile.summary.name}</p>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-secondary/20 p-4 sm:p-5"
        >
          <AiMessageBubble message={greeting} />
          {messages.map((message) => (
            <AiMessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingBubble />}
        </div>

        {messages.length === 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);
          }}
          className="mt-4 flex items-end gap-2 rounded-2xl border border-border bg-card p-2.5 shadow-sm"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
            placeholder="Ask a question about your dataset…"
            aria-label="Ask a question about your dataset"
            rows={1}
            className="max-h-32 min-h-0 flex-1 resize-none border-0 bg-transparent p-1.5 text-[13.5px] shadow-none focus-visible:ring-0"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
            className="size-9 shrink-0 rounded-xl"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </DashboardShell>
  );
}
