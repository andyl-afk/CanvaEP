"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";

export default function NewCallSheetPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    shoot_date: "",
    call_time: "07:00",
    wrap_time: "",
    catering: "",
    notes_text: "",
  });
  const [saving, setSaving] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.shoot_date || !form.call_time) return;
    setSaving(true);
    const payload = {
      shoot_date: form.shoot_date,
      call_time: form.call_time,
      wrap_time: form.wrap_time || null,
      catering: form.catering || null,
      notes: form.notes_text ? [form.notes_text] : [],
      status: "draft",
    };
    const { data, error } = await supabase
      .from("call_sheets")
      .insert(payload)
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      router.push(`/call-sheets/${data.id}`);
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
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link
          href="/call-sheets"
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
          New call sheet
        </h2>
      </div>

      <div className="flex flex-col gap-4 max-w-2xl">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3 sm:col-span-1">
            <label style={labelStyle}>Shoot date</label>
            <input
              style={inputStyle}
              type="date"
              value={form.shoot_date}
              onChange={(e) => set("shoot_date", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Call time</label>
            <input
              style={inputStyle}
              type="time"
              value={form.call_time}
              onChange={(e) => set("call_time", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Wrap time</label>
            <input
              style={inputStyle}
              type="time"
              value={form.wrap_time}
              onChange={(e) => set("wrap_time", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Catering</label>
          <input
            style={inputStyle}
            placeholder="e.g. Breakfast provided 6:30am. Lunch from 12:30pm."
            value={form.catering}
            onChange={(e) => set("catering", e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Notes</label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }}
            placeholder="Any general notes for the crew…"
            value={form.notes_text}
            onChange={(e) => set("notes_text", e.target.value)}
          />
        </div>

        <p
          className="text-xs"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          You can add locations, crew call times, and schedule after saving.
        </p>

        <div className="flex gap-3 pt-2">
          <Link
            href="/call-sheets"
            className="px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving || !form.shoot_date || !form.call_time}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40"
            style={{
              background: saving
                ? "rgba(90,50,250,0.4)"
                : "linear-gradient(135deg, #5a32fa, #7d2ae8)",
            }}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {saving ? "Creating…" : "Create call sheet"}
          </button>
        </div>
      </div>
    </div>
  );
}
