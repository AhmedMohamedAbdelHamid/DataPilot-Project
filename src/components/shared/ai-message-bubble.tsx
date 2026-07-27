"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth, initialsFor } from "@/lib/auth-store";
import type { ChatMessage } from "@/lib/types";

export function AiMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("flex items-end gap-2.5", isUser && "flex-row-reverse")}
    >
      {isUser ? (
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="bg-secondary text-[11px] font-semibold text-foreground">
            {initialsFor(user)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="size-3.5" strokeWidth={2.25} />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm sm:max-w-[70%]",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border bg-card text-foreground"
        )}
      >
        {message.content}
        <div
          className={cn(
            "mt-1 flex items-center gap-1.5 text-[10.5px]",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {message.timestamp}
          {message.source === "ai" && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-primary">
              <Sparkles className="size-2.5" strokeWidth={2.5} />
              AI-generated
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Sparkles className="size-3.5" strokeWidth={2.25} />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-muted-foreground/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
