"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Loader2 } from "lucide-react";
import Link from "next/link";

interface CallSheet {
  id: string;
  shoot_date: string;
  call_time: string;
  wrap_time: string | null;
  locations: { name: string; address: string; notes?: string }[];
  crew: { name: string; role: string; callTime: string; phone?: string }[];
  schedule: { time: string; activity: string; duration?: string }[];
  catering: string | null;
  notes: string[];
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft",  color: "rgba(255,255,255,0.4)" },
  final: { label: "Final",  color: "#00B870" },
  sent:  { label: "Sent",   color: "#4D8EF7" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function CallSheetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [sheet, setSheet] = useState<CallSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("call_sheets")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) setNotFound(true);
      else setSheet(data as CallSheet);
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

  if (notFound || !sheet) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Call sheet not found.</p>
        <Link href="/call-sheets" className="text-sm underline" style={{ color: "rgba(255,255,255,0.3)" }}>
          Back to call sheets
        </Link>
      </div>
    );
  }

  const status = STATUS_CONFIG[sheet.status] ?? STATUS_CONFIG.draft;

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "20px",
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.3)",
    marginBottom: "12px",
  };

  return (
    <div className="h-full flex flex-col p-5 md:p-8 gap-5 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link
          href="/call-sheets"
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <ArrowLeft size={15} color="rgba(255,255,255,0.6)" />
        </Link>
        <div>
          <h2
            style={{
              fontFamily: "Canva Sans Display",
              fontSize: "22px",
              letterSpacing: "-0.03em",
              color: "rgba(255,255,255,0.95)",
            }}
          >
            {formatDate(sheet.shoot_date)}
          </h2>
          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            <span className="flex items-center gap-1">
              <Clock size={11} /> Call {sheet.call_time}
              {sheet.wrap_time && ` · Wrap ${sheet.wrap_time}`}
            </span>
            <span
              className="px-2 py-0.5 rounded-full"
              style={{
                color: status.color,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl pb-6">
        {/* Locations */}
        {sheet.locations?.length > 0 && (
          <div style={cardStyle}>
            <p style={sectionLabel} className="flex items-center gap-1.5">
              <MapPin size={11} /> Locations
            </p>
            <div className="flex flex-col gap-3">
              {sheet.locations.map((loc, i) => (
                <div key={i}>
                  <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{loc.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{loc.address}</p>
                  {loc.notes && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{loc.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crew */}
        {sheet.crew?.length > 0 && (
          <div style={cardStyle}>
            <p style={sectionLabel} className="flex items-center gap-1.5">
              <Users size={11} /> Crew · {sheet.crew.length}
            </p>
            <div className="flex flex-col gap-2">
              {sheet.crew.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span style={{ color: "rgba(255,255,255,0.85)" }}>{c.name}</span>
                    <span className="ml-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{c.role}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: "#4D8EF7" }}>{c.callTime}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule */}
        {sheet.schedule?.length > 0 && (
          <div style={cardStyle} className="lg:col-span-2">
            <p style={sectionLabel} className="flex items-center gap-1.5">
              <Calendar size={11} /> Schedule
            </p>
            <div className="flex flex-col gap-2">
              {sheet.schedule.map((s, i) => (
                <div key={i} className="flex items-start gap-4 text-sm">
                  <span className="font-medium w-16 flex-shrink-0" style={{ color: "#4D8EF7" }}>{s.time}</span>
                  <span style={{ color: "rgba(255,255,255,0.8)" }}>{s.activity}</span>
                  {s.duration && <span className="ml-auto text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>{s.duration}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Catering */}
        {sheet.catering && (
          <div style={cardStyle}>
            <p style={sectionLabel}>Catering</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{sheet.catering}</p>
          </div>
        )}

        {/* Notes */}
        {sheet.notes?.length > 0 && (
          <div style={cardStyle}>
            <p style={sectionLabel}>Notes</p>
            <ul className="flex flex-col gap-1.5">
              {sheet.notes.map((note, i) => (
                <li key={i} className="text-sm flex items-start gap-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>–</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty state */}
        {!sheet.locations?.length && !sheet.crew?.length && !sheet.schedule?.length && (
          <div
            className="lg:col-span-2 rounded-xl p-8 flex flex-col items-center gap-3 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px dashed rgba(255,255,255,0.1)",
            }}
          >
            <Calendar size={24} style={{ color: "rgba(255,255,255,0.2)" }} />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
              Call sheet is empty. Locations, crew, and schedule coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
