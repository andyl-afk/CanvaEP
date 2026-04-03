"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Clock, FileText, AlertCircle, CheckCircle, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

interface Brief {
  id: string;
  title: string;
  requester_name: string | null;
  requester_role: string | null;
  priority: string;
  status: string;
  raw_text: string | null;
  extracted_info: Record<string, unknown>;
  gaps: string[];
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft:                { label: "Draft",              color: "rgba(255,255,255,0.4)", icon: Clock },
  "needs-interrogation":{ label: "Needs interrogation",color: "#FF7A2F",              icon: AlertCircle },
  "in-progress":        { label: "In progress",        color: "#4D8EF7",              icon: FileText },
  complete:             { label: "Complete",            color: "#00B870",             icon: CheckCircle },
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "rgba(255,255,255,0.35)",
  medium: "#FF7A2F",
  high: "#F05252",
  urgent: "#E040A0",
};

export default function BriefDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("briefs")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        setNotFound(true);
      } else {
        setBrief(data as Brief);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
      </div>
    );
  }

  if (notFound || !brief) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Brief not found.</p>
        <Link href="/briefs" className="text-sm underline" style={{ color: "rgba(255,255,255,0.3)" }}>
          Back to briefs
        </Link>
      </div>
    );
  }

  const status = STATUS_CONFIG[brief.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = status.icon;

  return (
    <div className="h-full flex flex-col p-5 md:p-8 gap-6 overflow-auto">
      {/* Header */}
      <div className="flex items-start gap-3 flex-shrink-0">
        <Link
          href="/briefs"
          className="w-8 h-8 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <ArrowLeft size={15} color="rgba(255,255,255,0.6)" />
        </Link>
        <div className="flex-1 min-w-0">
          <h2
            style={{
              fontFamily: "Canva Sans Display",
              fontSize: "22px",
              letterSpacing: "-0.03em",
              color: "rgba(255,255,255,0.95)",
              lineHeight: 1.2,
            }}
          >
            {brief.title}
          </h2>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {/* Status */}
            <div className="flex items-center gap-1.5 text-xs" style={{ color: status.color }}>
              <StatusIcon size={13} />
              {status.label}
            </div>
            {/* Priority */}
            <span
              className="text-xs px-2 py-0.5 rounded-full capitalize"
              style={{
                color: PRIORITY_COLOR[brief.priority],
                background: `${PRIORITY_COLOR[brief.priority]}18`,
                border: `1px solid ${PRIORITY_COLOR[brief.priority]}33`,
              }}
            >
              {brief.priority} priority
            </span>
            {/* Requester */}
            {brief.requester_name && (
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                {brief.requester_name}
                {brief.requester_role && ` · ${brief.requester_role}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 max-w-2xl">
        {/* Raw brief text */}
        {brief.raw_text && (
          <div
            className="rounded-xl p-5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Brief
            </p>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {brief.raw_text}
            </p>
          </div>
        )}

        {/* Extracted info */}
        {Object.keys(brief.extracted_info ?? {}).length > 0 && (
          <div
            className="rounded-xl p-5"
            style={{
              background: "rgba(90,50,250,0.08)",
              border: "1px solid rgba(90,50,250,0.2)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"
              style={{ color: "rgba(150,130,255,0.8)" }}
            >
              <Sparkles size={12} />
              Extracted info
            </p>
            <div className="flex flex-col gap-2">
              {Object.entries(brief.extracted_info).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                  <span
                    className="capitalize"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {key.replace(/_/g, " ")}
                  </span>
                  <span
                    className="col-span-2"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gaps */}
        {(brief.gaps ?? []).length > 0 && (
          <div
            className="rounded-xl p-5"
            style={{
              background: "rgba(255,122,47,0.07)",
              border: "1px solid rgba(255,122,47,0.2)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "rgba(255,122,47,0.8)" }}
            >
              Gaps to fill
            </p>
            <ul className="flex flex-col gap-1.5">
              {brief.gaps.map((gap, i) => (
                <li
                  key={i}
                  className="text-sm flex items-start gap-2"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  <span style={{ color: "rgba(255,122,47,0.6)", marginTop: "2px" }}>–</span>
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty state for new draft */}
        {!brief.raw_text && Object.keys(brief.extracted_info ?? {}).length === 0 && (
          <div
            className="rounded-xl p-8 flex flex-col items-center gap-3 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px dashed rgba(255,255,255,0.1)",
            }}
          >
            <Sparkles size={24} style={{ color: "rgba(255,255,255,0.2)" }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
              No brief content yet.
            </p>
            <button
              onClick={() => router.push(`/briefs/new`)}
              className="text-sm px-4 py-2 rounded-xl"
              style={{
                background: "rgba(90,50,250,0.2)",
                color: "rgba(150,130,255,0.9)",
                border: "1px solid rgba(90,50,250,0.3)",
              }}
            >
              Add content
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
