"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const PRIORITY_COLOR: Record<string, string> = {
  low: "rgba(255,255,255,0.4)",
  medium: "#FF7A2F",
  high: "#F05252",
  urgent: "#E040A0",
};

export default function NewBriefPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    requester_name: "",
    requester_role: "",
    priority: "medium" as typeof PRIORITIES[number],
    raw_text: "",
  });
  const [saving, setSaving] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(status: "draft" | "needs-interrogation") {
    if (!form.title.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("briefs")
      .insert({ ...form, status })
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      router.push(`/briefs/${data.id}`);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "10px",
    color: "rgba(255,255,255,0.9)",
    padding: "10px 14px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.3)",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div className="h-full flex flex-col p-5 md:p-8 gap-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link
          href="/briefs"
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <ArrowLeft size={15} color="rgba(255,255,255,0.6)" />
        </Link>
        <h2
          style={{
            fontFamily: "Canva Sans Display",
            fontSize: "22px",
            letterSpacing: "-0.03em",
            color: "rgba(255,255,255,0.95)",
          }}
        >
          New brief
        </h2>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4 max-w-2xl">
        <div>
          <label style={labelStyle}>Project title</label>
          <input
            style={inputStyle}
            placeholder="e.g. Canva Enterprise Launch — hero film"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Requester name</label>
            <input
              style={inputStyle}
              placeholder="e.g. Sarah Chen"
              value={form.requester_name}
              onChange={(e) => set("requester_name", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Requester role / team</label>
            <input
              style={inputStyle}
              placeholder="e.g. Brand Marketing"
              value={form.requester_role}
              onChange={(e) => set("requester_role", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Priority</label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => set("priority", p)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                style={{
                  background: form.priority === p
                    ? `${PRIORITY_COLOR[p]}22`
                    : "rgba(255,255,255,0.05)",
                  border: form.priority === p
                    ? `1px solid ${PRIORITY_COLOR[p]}55`
                    : "1px solid rgba(255,255,255,0.08)",
                  color: form.priority === p
                    ? PRIORITY_COLOR[p]
                    : "rgba(255,255,255,0.4)",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Brief / context</label>
          <textarea
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: "160px",
              lineHeight: "1.6",
            }}
            placeholder="Paste the brief, email thread, Slack message — whatever you have. The more context the better."
            value={form.raw_text}
            onChange={(e) => set("raw_text", e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving || !form.title.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Save as draft
          </button>
          <button
            onClick={() => handleSave("needs-interrogation")}
            disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40"
            style={{
              background: saving
                ? "rgba(90,50,250,0.4)"
                : "linear-gradient(135deg, #5a32fa, #7d2ae8)",
            }}
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}
            {saving ? "Saving…" : "Interrogate brief"}
          </button>
        </div>
      </div>
    </div>
  );
}
