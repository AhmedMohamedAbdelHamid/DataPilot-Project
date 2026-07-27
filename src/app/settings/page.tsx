"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth, displayNameFor, initialsFor } from "@/lib/auth-store";

export default function SettingsPage() {
  const { user } = useAuth();
  const name = displayNameFor(user);
  const initials = initialsFor(user);

  return (
    <DashboardShell title="Settings">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          Manage your profile and workspace preferences.
        </p>

        <div className="mt-6 card-shadow rounded-2xl border border-border bg-card p-6">
          <h2 className="text-[13.5px] font-semibold text-foreground">Profile</h2>
          <div className="mt-4 flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-primary text-[16px] font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">Change avatar</Button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name" className="text-[12.5px] font-medium text-foreground">Full name</Label>
              <Input id="name" key={name} defaultValue={name} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email" className="text-[12.5px] font-medium text-foreground">Email</Label>
              <Input id="email" type="email" value={user?.email ?? ""} disabled readOnly className="mt-1.5" />
            </div>
          </div>
        </div>

        <div className="mt-5 card-shadow rounded-2xl border border-border bg-card p-6">
          <h2 className="text-[13.5px] font-semibold text-foreground">Preferences</h2>
          <div className="mt-4 space-y-4">
            {[
              { id: "email-notifs", label: "Email me when analysis completes", defaultChecked: true },
              { id: "weekly-digest", label: "Weekly workspace digest", defaultChecked: false },
              { id: "auto-detect", label: "Auto-detect column types on upload", defaultChecked: true },
            ].map((pref, i, arr) => (
              <div key={pref.id}>
                <div className="flex items-center justify-between">
                  <Label htmlFor={pref.id} className="text-[13px] font-normal text-foreground">
                    {pref.label}
                  </Label>
                  <Switch id={pref.id} defaultChecked={pref.defaultChecked} />
                </div>
                {i < arr.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button>Save changes</Button>
        </div>
      </div>
    </DashboardShell>
  );
}
