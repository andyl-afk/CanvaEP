"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Users,
  Calendar,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/briefs", label: "Briefs", icon: FileText },
  { href: "/crew", label: "Crew", icon: Users },
  { href: "/call-sheets", label: "Call sheets", icon: Calendar },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-60 flex-shrink-0 h-full relative"
        style={{
          background: "rgba(10,10,20,0.6)",
          backdropFilter: "blur(24px) saturate(180%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Gradient bar on left edge */}
        <div
          className="absolute inset-y-0 left-0 w-[2px]"
          style={{ background: "linear-gradient(180deg, #00c4cc, #5a32fa, #7d2ae8)" }}
        />

        {/* Logo */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-baseline gap-1">
            <span
              className="text-2xl gradient-text"
              style={{ fontFamily: "Canva Sans Display", letterSpacing: "-0.03em" }}
            >
              Canva
            </span>
            <span
              className="text-2xl font-bold"
              style={{
                fontFamily: "Canva Sans Display",
                letterSpacing: "-0.03em",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              EP
            </span>
          </div>
          <p
            className="mt-1 text-xs"
            style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}
          >
            Production studio
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                style={{
                  background: isActive
                    ? "rgba(90,50,250,0.18)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(90,50,250,0.3)"
                    : "1px solid transparent",
                  color: isActive
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.5)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.75)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.5)";
                  }
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{
                    color: isActive ? "#7d6afa" : "inherit",
                    flexShrink: 0,
                  }}
                />
                <span
                  className="text-sm"
                  style={{ fontWeight: isActive ? 500 : 400 }}
                >
                  {label}
                </span>
                {isActive && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #00c4cc, #5a32fa)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user area */}
        <div
          className="mx-3 mb-4 px-3 py-2.5 rounded-xl flex items-center gap-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium"
            style={{
              background: "linear-gradient(135deg, #00c4cc, #5a32fa)",
              color: "white",
            }}
          >
            A
          </div>
          <div className="min-w-0">
            <p className="text-sm truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
              Andy
            </p>
            <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>
              Senior videographer
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile header */}
        <header
          className="md:hidden flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0 relative"
          style={{
            background: "rgba(10,10,20,0.7)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Gradient bar at top */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(90deg, #00c4cc, #5a32fa, #7d2ae8)" }}
          />
          <div className="flex items-baseline gap-1">
            <span
              className="text-xl gradient-text"
              style={{ fontFamily: "Canva Sans Display", letterSpacing: "-0.03em" }}
            >
              Canva
            </span>
            <span
              className="text-xl font-bold"
              style={{
                fontFamily: "Canva Sans Display",
                letterSpacing: "-0.03em",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              EP
            </span>
          </div>
          {/* Current page label */}
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {navItems.find((n) =>
              n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)
            )?.label ?? ""}
          </span>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-hidden scroll-area">
          {children}
        </div>

        {/* ── Mobile bottom tab bar ──────────────────────────── */}
        <nav
          className="md:hidden flex items-center justify-around flex-shrink-0 px-2 py-1"
          style={{
            background: "rgba(10,10,20,0.85)",
            backdropFilter: "blur(24px) saturate(180%)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-150"
                style={{ minWidth: 64 }}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{
                    color: isActive ? "#7d6afa" : "rgba(255,255,255,0.38)",
                  }}
                />
                <span
                  className="text-center"
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.01em",
                    color: isActive
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.38)",
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
