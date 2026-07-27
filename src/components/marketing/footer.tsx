import Link from "next/link";
import { Gauge } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Data Quality", href: "/data-quality" },
      { label: "AI Insights", href: "/insights" },
      { label: "Ask AI", href: "/ask-ai" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Gauge className="size-4.5" strokeWidth={2.25} />
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-foreground">DataPilot</span>
            </Link>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              The AI-powered data insight studio for teams who want answers, not spreadsheets.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[12.5px] font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-[12px] text-muted-foreground">
            © 2026 DataPilot. Built by Team 7.
          </p>
          <div className="flex gap-5">
            <Link href="#" className="text-[12px] text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="#" className="text-[12px] text-muted-foreground hover:text-foreground">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
