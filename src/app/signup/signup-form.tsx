"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, type AuthActionState } from "@/lib/auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="mt-1 w-full gap-1.5" disabled={pending}>
      {pending && <Loader2 className="size-3.5 animate-spin" />}
      {pending ? "Creating account…" : "Create account"}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState<AuthActionState, FormData>(signUp, null);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 className="size-6" strokeWidth={1.75} />
        </div>
        <p className="text-[13px] leading-relaxed text-muted-foreground">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-[12.5px] text-destructive">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div>
        <Label htmlFor="name" className="text-[12.5px] font-medium text-foreground">
          Full name
        </Label>
        <Input id="name" name="name" autoComplete="name" placeholder="Jane Doe" required className="mt-1.5" />
      </div>

      <div>
        <Label htmlFor="email" className="text-[12.5px] font-medium text-foreground">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-[12.5px] font-medium text-foreground">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
          minLength={8}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="text-[12.5px] font-medium text-foreground">
          Confirm password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          required
          minLength={8}
          className="mt-1.5"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
