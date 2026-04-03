"use client";

import { useState } from "react";
import { ArrowRight, FileText, Users, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

const QUICK_ACTIONS = [
  {
    label: "Start a new brief",
    icon: FileText,
    href: "/briefs/new",
    color: "#4D8EF7",
  },
  {
    label: "Check crew availability",
    icon: Users,
    href: "/crew",
    color: "#00C4CC",
  },
  {
    label: "Generate a call sheet",
    icon: Calendar,
    href: "/call-sheets/new",
    color: "#9B59B6",
  },
];

export default function HomePage() {
  const [input, setInput] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    // Future: route to AI-assisted flow
    router.push(`/briefs/new?q=${encodeURIComponent(input.trim())}`);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pb-16 md:pb-0">
      {/* Title */}
      <div className="text-center mb-8">
        <h1
          className="gradient-text mb-3"
          style={{
            fontFamily: "Canva Sans Display",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          CanvaEP
        </h1>
        <p
          className="text-base"
          style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "-0.01em" }}
        >
          Production management for the Canva studio
        </p>
      </div>

      {/* Prompt input */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl mb-6"
      >
        <div
          className="relative flex items-center rounded-xl overflow-hidden transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 0 0 transparent",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLElement).style.border =
              "1px solid rgba(90,50,250,0.5)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 0 3px rgba(90,50,250,0.12)";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLElement).style.border =
              "1px solid rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 0 0 transparent";
          }}
        >
          <input
            type="text"
            className="flex-1 px-5 py-4 bg-transparent text-base outline-none"
            style={{
              color: "rgba(255,255,255,0.9)",
              border: "none",
              borderRadius: 0,
            }}
            placeholder="What are you working on?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex items-center justify-center w-10 h-10 mr-2 rounded-lg transition-all duration-150 disabled:opacity-30"
            style={{
              background: input.trim()
                ? "linear-gradient(135deg, #5a32fa, #7d2ae8)"
                : "rgba(255,255,255,0.08)",
            }}
          >
            <ArrowRight size={16} color="white" />
          </button>
        </div>
      </form>

      {/* Quick action pills */}
      <div className="flex flex-wrap gap-2.5 justify-center max-w-lg">
        {QUICK_ACTIONS.map(({ label, icon: Icon, href, color }) => (
          <button
            key={label}
            onClick={() => router.push(href)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-150"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.65)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.16)";
              (e.currentTarget as HTMLElement).style.color =
                "rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.09)";
              (e.currentTarget as HTMLElement).style.color =
                "rgba(255,255,255,0.65)";
            }}
          >
            <Icon size={14} style={{ color }} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
