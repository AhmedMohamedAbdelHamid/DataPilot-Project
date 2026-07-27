import {
  LayoutDashboard,
  UploadCloud,
  ShieldCheck,
  BarChart3,
  Sparkles,
  MessageCircle,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Dataset", icon: UploadCloud },
  { href: "/data-quality", label: "Data Quality", icon: ShieldCheck },
  { href: "/charts", label: "Charts", icon: BarChart3 },
  { href: "/insights", label: "AI Insights", icon: Sparkles },
  { href: "/ask-ai", label: "Ask AI", icon: MessageCircle },
  { href: "/reports", label: "Reports", icon: FileText },
];

export const settingsNavItem: NavItem = {
  href: "/settings",
  label: "Settings",
  icon: Settings,
};
