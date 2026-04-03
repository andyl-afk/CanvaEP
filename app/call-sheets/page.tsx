import Link from "next/link";
import { Plus, Calendar, Clock, MapPin, Users } from "lucide-react";

const MOCK_CALL_SHEETS = [
  {
    id: "1",
    projectName: "Canva Enterprise Launch — hero film",
    shootDate: "2026-04-08",
    callTime: "06:30",
    location: "Canva HQ, Level 7, 110 Kippax St, Surry Hills",
    crewCount: 8,
    status: "draft",
  },
  {
    id: "2",
    projectName: "Q2 Brand Refresh — social content",
    shootDate: "2026-04-15",
    callTime: "07:00",
    location: "Studio 3, Fox Studios, Moore Park",
    crewCount: 5,
    status: "final",
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "rgba(255,255,255,0.4)" },
  final: { label: "Final", color: "#00B870" },
  sent: { label: "Sent", color: "#4D8EF7" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CallSheetsPage() {
  return (
    <div className="h-full flex flex-col p-5 md:p-8 gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2
            className="text-2xl"
            style={{
              fontFamily: "Canva Sans Display",
              letterSpacing: "-0.03em",
              color: "rgba(255,255,255,0.95)",
            }}
          >
            Call sheets
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            {MOCK_CALL_SHEETS.length} upcoming shoots
          </p>
        </div>
        <Link
          href="/call-sheets/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-150"
          style={{
            background: "linear-gradient(135deg, #5a32fa, #7d2ae8)",
          }}
        >
          <Plus size={16} />
          New call sheet
        </Link>
      </div>

      {/* List */}
      <div className="flex-1 scroll-area -mr-2 pr-2">
        <div className="flex flex-col gap-3">
          {MOCK_CALL_SHEETS.map((cs) => {
            const status = STATUS_CONFIG[cs.status];
            return (
              <Link
                key={cs.id}
                href={`/call-sheets/${cs.id}`}
                className="glass relative p-5 block transition-all duration-150 hover:border-white/[0.14] overflow-hidden"
              >
                {/* Gradient top bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background:
                      "linear-gradient(90deg, #00c4cc, #5a32fa, #7d2ae8)",
                  }}
                />
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3
                    className="text-sm font-medium leading-snug"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {cs.projectName}
                  </h3>
                  <span
                    className="text-xs flex-shrink-0 px-2 py-0.5 rounded-full"
                    style={{
                      color: status.color,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {status.label}
                  </span>
                </div>
                <div
                  className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} style={{ color: "#4D8EF7" }} />
                    {formatDate(cs.shootDate)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} style={{ color: "#00C4CC" }} />
                    Call time {cs.callTime}
                  </span>
                  <span className="flex items-center gap-1.5 col-span-2">
                    <MapPin size={12} style={{ color: "#9B59B6" }} />
                    {cs.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={12} style={{ color: "#00B870" }} />
                    {cs.crewCount} crew
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
