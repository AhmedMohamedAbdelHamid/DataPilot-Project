"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/visually-hidden";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { useAuth, displayNameFor, initialsFor } from "@/lib/auth-store";

const notifications = [
  { id: 1, title: "Data quality scan complete", body: "5 issues found in customer_churn_2026.csv", time: "2m ago" },
  { id: 2, title: "AI insights ready", body: "8 new findings generated", time: "12m ago" },
  { id: 3, title: "Report exported", body: "Q2 marketing report is ready to download", time: "1h ago" },
];

export function Navbar({ title }: { title?: string }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  const name = displayNameFor(user);
  const initials = initialsFor(user);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        aria-label="Open navigation menu"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <VisuallyHidden>
            <SheetTitle>Navigation</SheetTitle>
          </VisuallyHidden>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {title && (
        <h1 className="hidden shrink-0 text-[15px] font-semibold text-foreground sm:block">
          {title}
        </h1>
      )}

      <div className="relative ml-auto w-full max-w-xs sm:ml-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search datasets, insights…"
          aria-label="Search"
          className="h-9 rounded-full border-border bg-secondary/50 pl-9 text-[13px] shadow-none focus-visible:bg-card"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:ml-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full text-muted-foreground hover:text-foreground"
                aria-label="View notifications"
              />
            }
          >
            <Bell className="size-[18px]" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <Badge variant="secondary" className="text-[10px]">3 new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5">
                  <span className="text-[13px] font-medium">{n.title}</span>
                  <span className="text-[12px] text-muted-foreground">{n.body}</span>
                  <span className="text-[11px] text-muted-foreground/70">{n.time}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="ml-1 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open profile menu"
          >
            <Avatar className="size-8">
              <AvatarImage src="" alt="" />
              <AvatarFallback className="bg-primary text-[12px] font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col">
                <span className="text-[13px] font-medium">{name || "Signed in"}</span>
                {user?.email && (
                  <span className="text-[12px] font-normal text-muted-foreground">{user.email}</span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/settings" />}>Profile</DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings" />}>Team settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => signOut()}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
