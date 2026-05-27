"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  DollarSign,
  Pencil,
  Camera,
  Check,
  X,
  Loader2,
  Trash2,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────

type AvailStatus = "available" | "busy" | "tentative" | "unavailable";

interface Member {
  id: string;
  name: string;
  role: string;
  location: string | null;
  type: "internal" | "external";
  craft: string | null;
  skills: string[];
  availability_status: AvailStatus;
  day_rate: number | null;
  company: string | null;
  notes: string | null;
  avatar_url: string | null;
}

type EditForm = {
  name: string;
  role: string;
  location: string;
  availability_status: AvailStatus;
  day_rate: string;
  notes: string;
};

// ── Config ────────────────────────────────────────────────

const AVAIL_CONFIG: Record<AvailStatus, { label: string; color: string; dot: string }> = {
  available:   { label: "Available",   color: "#00B870", dot: "#00B870" },
  busy:        { label: "Busy",        color: "#FF7A2F", dot: "#FF7A2F" },
  tentative:   { label: "Tentative",   color: "#4D8EF7", dot: "#4D8EF7" },
  unavailable: { label: "Unavailable", color: "rgba(255,255,255,0.3)", dot: "rgba(255,255,255,0.2)" },
};

// Section order and accent colours
const CRAFT_CONFIG: Record<string, { icon: string; accent: string }> = {
  "Video & Photo":   { icon: "📹", accent: "rgba(0,196,204,0.15)" },
  "Motion":          { icon: "✦",  accent: "rgba(90,50,250,0.15)" },
  "Producers & Ops": { icon: "🎯", accent: "rgba(255,122,47,0.12)" },
  "External":        { icon: "🤝", accent: "rgba(77,142,247,0.12)" },
};
const CRAFT_ORDER = ["Video & Photo", "Motion", "Producers & Ops", "External"];

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #00c4cc, #4D8EF7)",
  "linear-gradient(135deg, #5a32fa, #7d2ae8)",
  "linear-gradient(135deg, #00B870, #4D8EF7)",
  "linear-gradient(135deg, #FF7A2F, #F05252)",
  "linear-gradient(135deg, #E040A0, #5a32fa)",
  "linear-gradient(135deg, #9B59B6, #5a32fa)",
];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// ── Collapsible section ───────────────────────────────────

function Section({
  craft,
  members,
  allMembers,
  onEdit,
  onUpload,
  uploadingId,
}: {
  craft: string;
  members: Member[];
  allMembers: Member[];
  onEdit: (m: Member) => void;
  onUpload: (m: Member, f: File) => void;
  uploadingId: string | null;
}) {
  const [open, setOpen] = useState(true);
  const config = CRAFT_CONFIG[craft] ?? { icon: "◆", accent: "rgba(255,255,255,0.06)" };
  const availableCount = members.filter((m) => m.availability_status === "available").length;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Section header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
        style={{ background: config.accent }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ fontSize: "15px" }}>{config.icon}</span>
          <span
            className="text-sm font-semibold"
            style={{
              fontFamily: "Canva Sans Display",
              letterSpacing: "-0.01em",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {craft}
          </span>
          <span
            className="px-1.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {members.length}
          </span>
          {availableCount > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                background: "rgba(0,184,112,0.15)",
                color: "#00B870",
              }}
            >
              {availableCount} available
            </span>
          )}
        </div>
        <ChevronDown
          size={15}
          style={{
            color: "rgba(255,255,255,0.3)",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {/* Cards grid */}
      {open && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 p-3"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          {members.map((member) => {
            // stable gradient index based on position in full list
            const idx = allMembers.findIndex((m) => m.id === member.id);
            return (
              <MemberCard
                key={member.id}
                member={member}
                index={idx}
                onEdit={onEdit}
                onUpload={onUpload}
                uploading={uploadingId === member.id}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Member card ───────────────────────────────────────────

function MemberCard({
  member,
  index,
  onEdit,
  onUpload,
  uploading,
}: {
  member: Member;
  index: number;
  onEdit: (m: Member) => void;
  onUpload: (m: Member, f: File) => void;
  uploading: boolean;
}) {
  const avail = AVAIL_CONFIG[member.availability_status];
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="glass p-3.5 relative group/card flex items-start gap-3"
      style={{ borderRadius: "12px" }}
    >
      {/* Edit button */}
      <button
        onClick={() => onEdit(member)}
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <Pencil size={10} color="rgba(255,255,255,0.5)" />
      </button>

      {/* Avatar */}
      <div
        className="relative flex-shrink-0 group/av cursor-pointer"
        style={{ width: 34, height: 34 }}
        onClick={() => fileRef.current?.click()}
      >
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={member.name}
            className="rounded-full object-cover w-full h-full"
            style={{ border: "2px solid rgba(255,255,255,0.08)" }}
          />
        ) : (
          <div
            className="rounded-full w-full h-full flex items-center justify-center text-xs font-medium text-white"
            style={{ background: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length] }}
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : initials(member.name)}
          </div>
        )}
        {!uploading && (
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition-opacity"
            style={{ background: "rgba(0,0,0,0.55)" }}
          >
            <Camera size={11} color="white" />
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(member, file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 pr-5">
        <div className="flex items-center justify-between gap-1">
          <span
            className="text-sm font-medium truncate"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            {member.name}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: avail.dot }} />
            <span className="text-xs" style={{ color: avail.color, fontSize: "11px" }}>
              {avail.label}
            </span>
          </div>
        </div>
        <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
          {member.role}
          {member.day_rate && (
            <span style={{ color: "rgba(255,255,255,0.25)" }}>
              {" · "}
              <DollarSign size={10} className="inline -mt-0.5" />
              {member.day_rate.toLocaleString()}/day
            </span>
          )}
        </p>
        {member.location && (
          <div
            className="flex items-center gap-1 mt-1 text-xs"
            style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}
          >
            <MapPin size={10} />
            {member.location}
          </div>
        )}
        {member.notes && (
          <p
            className="text-xs mt-1.5 leading-relaxed line-clamp-2"
            style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}
          >
            {member.notes}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Edit modal ────────────────────────────────────────────

function EditModal({
  member,
  onSave,
  onDelete,
  onClose,
}: {
  member: Member;
  onSave: (id: string, form: EditForm) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<EditForm>({
    name: member.name,
    role: member.role,
    location: member.location ?? "",
    availability_status: member.availability_status,
    day_rate: member.day_rate?.toString() ?? "",
    notes: member.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function set(field: keyof EditForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(member.id, form);
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    await onDelete(member.id);
    setDeleting(false);
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.9)",
    padding: "8px 12px",
    fontSize: "13px",
    width: "100%",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.3)",
    marginBottom: "4px",
    display: "block",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: "rgba(20,20,35,0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex items-center justify-between">
          <h3
            style={{
              fontFamily: "Canva Sans Display",
              fontSize: "18px",
              letterSpacing: "-0.02em",
              color: "rgba(255,255,255,0.95)",
            }}
          >
            Edit {member.name.split(" ")[0]}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <X size={14} color="rgba(255,255,255,0.6)" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Name</label>
              <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <input style={inputStyle} value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Sr. Videographer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Location</label>
              <input style={inputStyle} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Sydney" />
            </div>
            <div>
              <label style={labelStyle}>Availability</label>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.availability_status}
                onChange={(e) => set("availability_status", e.target.value as AvailStatus)}
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="tentative">Tentative</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
          {member.type === "external" && (
            <div>
              <label style={labelStyle}>Day rate (AUD)</label>
              <input style={inputStyle} type="number" value={form.day_rate} onChange={(e) => set("day_rate", e.target.value)} placeholder="e.g. 850" />
            </div>
          )}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: "72px" }}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Skills, strengths, anything useful…"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-1">
          {confirmDelete ? (
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Keep
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: "rgba(220,50,50,0.8)", color: "white" }}
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? "Deleting…" : "Confirm delete"}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(220,50,50,0.12)", border: "1px solid rgba(220,50,50,0.2)" }}
                title="Delete"
              >
                <Trash2 size={14} color="rgba(220,100,100,0.9)" />
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: saving ? "rgba(90,50,250,0.4)" : "rgba(90,50,250,0.8)", color: "white" }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────

export default function CrewPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => { loadMembers(); }, []);

  async function syncFromSheet() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/sync-crew", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setSyncMsg({ type: "success", text: `Synced ${json.synced} crew members from spreadsheet` });
        await loadMembers();
      } else {
        setSyncMsg({ type: "error", text: json.error ?? "Sync failed" });
      }
    } catch {
      setSyncMsg({ type: "error", text: "Network error — could not reach sync API" });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 5000);
    }
  }

  async function loadMembers() {
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .order("name", { ascending: true });
    if (data) setMembers(data as Member[]);
    setLoading(false);
  }

  async function saveEdit(id: string, form: EditForm) {
    const patch = {
      name: form.name.trim(),
      role: form.role.trim(),
      location: form.location.trim() || null,
      availability_status: form.availability_status,
      day_rate: form.day_rate ? parseInt(form.day_rate) : null,
      notes: form.notes.trim() || null,
    };
    const { error } = await supabase.from("team_members").update(patch).eq("id", id);
    if (!error) {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
      setEditingMember(null);
    }
  }

  async function deleteMember(id: string) {
    await supabase.from("team_members").delete().eq("id", id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setEditingMember(null);
  }

  async function uploadPhoto(member: Member, file: File) {
    setUploadingId(member.id);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${member.id}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from("team_members").update({ avatar_url: url }).eq("id", member.id);
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, avatar_url: url } : m)));
    }
    setUploadingId(null);
  }

  // Group members
  const internal = members.filter((m) => m.type === "internal");
  const external = members.filter((m) => m.type === "external");

  const byCraft = CRAFT_ORDER.slice(0, 3).map((craft) => ({
    craft,
    members: internal.filter((m) => (m.craft ?? "Producers & Ops") === craft),
  })).filter((g) => g.members.length > 0);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col p-5 md:p-8 gap-4 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2
            className="text-2xl"
            style={{ fontFamily: "Canva Sans Display", letterSpacing: "-0.03em", color: "rgba(255,255,255,0.95)" }}
          >
            Crew
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              {internal.length} internal · {external.length} external
            </span>
            <button
              onClick={syncFromSheet}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity"
              style={{
                background: "rgba(90,50,250,0.2)",
                border: "1px solid rgba(90,50,250,0.35)",
                color: syncing ? "rgba(150,130,255,0.5)" : "rgba(150,130,255,0.9)",
              }}
            >
              {syncing
                ? <Loader2 size={12} className="animate-spin" />
                : <RefreshCw size={12} />
              }
              {syncing ? "Syncing…" : "Sync from sheet"}
            </button>
          </div>
        </div>

        {/* Sync status message */}
        {syncMsg && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
            style={{
              background: syncMsg.type === "success"
                ? "rgba(0,184,112,0.1)"
                : "rgba(240,82,82,0.1)",
              border: `1px solid ${syncMsg.type === "success" ? "rgba(0,184,112,0.25)" : "rgba(240,82,82,0.25)"}`,
              color: syncMsg.type === "success" ? "#00B870" : "#F05252",
            }}
          >
            {syncMsg.text}
          </div>
        )}

        {/* Internal sections by craft */}
        {byCraft.map(({ craft, members: craftMembers }) => (
          <Section
            key={craft}
            craft={craft}
            members={craftMembers}
            allMembers={members}
            onEdit={setEditingMember}
            onUpload={uploadPhoto}
            uploadingId={uploadingId}
          />
        ))}

        {/* External */}
        {external.length > 0 && (
          <Section
            craft="External"
            members={external}
            allMembers={members}
            onEdit={setEditingMember}
            onUpload={uploadPhoto}
            uploadingId={uploadingId}
          />
        )}

        <div className="pb-4" />
      </div>

      {editingMember && (
        <EditModal
          member={editingMember}
          onSave={saveEdit}
          onDelete={deleteMember}
          onClose={() => setEditingMember(null)}
        />
      )}
    </>
  );
}
