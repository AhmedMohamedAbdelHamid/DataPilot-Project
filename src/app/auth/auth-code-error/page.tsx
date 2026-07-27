import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";

export default function AuthCodeErrorPage() {
  return (
    <AuthShell
      title="Link expired or invalid"
      description="That confirmation link didn't work — it may have already been used or expired."
    >
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" strokeWidth={1.75} />
        </div>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Try signing up again, or sign in if you already confirmed your email on another device.
        </p>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1" nativeButton={false} render={<Link href="/signup" />}>
            Back to sign up
          </Button>
          <Button className="flex-1" nativeButton={false} render={<Link href="/login" />}>
            Go to sign in
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
