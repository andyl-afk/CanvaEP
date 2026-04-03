import Link from "next/link";
import { Plus, FileText, Clock, AlertCircle, CheckCircle } from "lucide-react";

const MOCK_BRIEFS = [
  {
    id: "1",
    title: "Canva Enterprise Launch — hero film",
    requester: "Marketing team",
    status: "in-progress",
    priority: "high",
    updatedAt: "2 hours ago",
  },
  {
    id: "2",
    title: "Q2 Brand Refresh — social content series",
    requester: "Brand team",
    status: "needs-info",
    priority: "medium",
    updatedAt: "Yesterday",
  },
  {
    id: "3",
    title: "Canva for Teams — customer testimonials",
    requester: "Growth team",
    status: "draft",
    priority: "low",
    updatedAt: "3 days ago",
  },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  draft: {
    label: "Draft",
    color: "rgba(255,255,255,0.4)",
    icon: Clock,
  },
  "in-progress": {
    label: "In progress",
    color: "#4D8EF7",
    icon: FileText,
  },
  "needs-info": {
    label: "Needs info",
    color: "#FF7A2F",
    icon: AlertCircle,
  },
  complete: {
    label: "Complete",
    color: "#00B870",
    icon: CheckCircle,
  },
};

const PRIORITY_COLOR: Record<string, string> = {
  high: "#F05252",
  medium: "#FF7A2F",
  low: "rgba(255,255,255,0.3)",
};

export default function BriefsPage() {
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
            Briefs
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            {MOCK_BRIEFS.length} active briefs
          </p>
        </div>
        <Link
          href="/briefs/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-150"
          style={{
            background: "linear-gradient(135deg, #5a32fa, #7d2ae8)",
          }}
        >
          <Plus size={16} />
          New brief
        </Link>
      </div>

      {/* Briefs list */}
      <div className="flex-1 scroll-area -mr-2 pr-2">
        <div className="flex flex-col gap-3">
          {MOCK_BRIEFS.map((brief) => {
            const status = STATUS_CONFIG[brief.status];
            const StatusIcon = status.icon;
            return (
              <Link
                key={brief.id}
                href={`/briefs/${brief.id}`}
                className="glass relative p-5 block transition-all duration-150 hover:border-white/[0.14]"
              >
                {/* Priority indicator */}
                <div
                  className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
                  style={{
                    background: PRIORITY_COLOR[brief.priority],
                    left: "12px",
                  }}
                />
                <div className="pl-4">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3
                      className="text-sm font-medium leading-snug"
                      style={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      {brief.title}
                    </h3>
                    <div
                      className="flex items-center gap-1.5 flex-shrink-0 text-xs"
                      style={{ color: status.color }}
                    >
                      <StatusIcon size={13} strokeWidth={2} />
                      {status.label}
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-3 text-xs"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    <span>{brief.requester}</span>
                    <span>·</span>
                    <span>Updated {brief.updatedAt}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
