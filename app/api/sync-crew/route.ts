import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

// Valid location codes in the sheet → full location names
const LOCATION_MAP: Record<string, string> = {
  SYD:   "Sydney",
  MNL:   "Manila",
  MEL:   "Melbourne",
  CA:    "California",
  BYN:   "Byron Bay",
  BYRON: "Byron Bay",
  GLD:   "Gold Coast",
  TBD:   "TBD",
};
const VALID_LOCATIONS = new Set(Object.keys(LOCATION_MAP));

// Crafts we want to import → CanvaEP craft label
const CRAFT_MAP: Record<string, string> = {
  Motion: "Motion",
  Video:  "Video & Photo",
  Ops:    "Producers & Ops",
};

// Words that indicate a row is a job listing or placeholder, not a real person
const SKIP_NAME_KEYWORDS = ["hiring", "open", "tbd", "n/a", "vacant", "role", "position", "admin"];

function isValidPersonName(name: string): boolean {
  if (!name || name.length < 4 || name.length > 45) return false;
  // Must have at least two words (first + last name)
  if (!name.includes(" ")) return false;
  // Section headers are ALL CAPS
  if (name === name.toUpperCase() && name.length > 5) return false;
  // Must start with a capital letter
  if (!/^[A-Z]/.test(name)) return false;
  // Skip job listings / placeholders
  const lower = name.toLowerCase();
  if (SKIP_NAME_KEYWORDS.some((w) => lower.includes(w))) return false;
  return true;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const row: string[] = [];
    let inQuote = false;
    let field = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        row.push(field.trim());
        field = "";
      } else {
        field += ch;
      }
    }
    row.push(field.trim());
    rows.push(row);
  }
  return rows;
}

async function fetchSheetCSV(gid: string): Promise<string[][] | null> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return parseCSV(await res.text());
}

function extractPeople(rows: string[][]): Map<string, {
  name: string; craft: string; role: string; location: string | null;
}> {
  const people = new Map<string, { name: string; craft: string; role: string; location: string | null }>();

  for (const row of rows) {
    // Column structure: [Name, Craft, Role, Location, AM/PM, ...weekly assignments]
    const name      = row[0]?.trim() ?? "";
    const rawCraft  = row[1]?.trim() ?? "";
    const role      = row[2]?.trim() ?? "";
    const locCode   = row[3]?.trim().toUpperCase() ?? "";

    // Must be a target craft
    const mappedCraft = CRAFT_MAP[rawCraft];
    if (!mappedCraft) continue;

    // Must be a valid person name
    if (!isValidPersonName(name)) continue;

    // Must have a recognised location code (rules out section headers + bad rows)
    if (!VALID_LOCATIONS.has(locCode)) continue;

    const location = LOCATION_MAP[locCode] ?? null;

    // Deduplicate by normalised name — first occurrence wins
    const key = name.toLowerCase().replace(/\s+/g, " ");
    if (!people.has(key)) {
      people.set(key, { name, craft: mappedCraft, role, location });
    }
  }

  return people;
}

export async function POST() {
  try {
    if (!SHEET_ID) {
      return Response.json({ error: "GOOGLE_SHEET_ID not configured" }, { status: 500 });
    }

    // Fetch the first two tabs (gid=0 and gid=1) and merge results
    const [rows0, rows1] = await Promise.all([
      fetchSheetCSV("0"),
      fetchSheetCSV("1"),
    ]);

    if (!rows0 && !rows1) {
      return Response.json({ error: "Could not fetch spreadsheet" }, { status: 502 });
    }

    const people = new Map<string, { name: string; craft: string; role: string; location: string | null }>();

    // Process both sheets — deduplication handles any overlap
    for (const rows of [rows0, rows1]) {
      if (!rows) continue;
      for (const [key, person] of extractPeople(rows)) {
        if (!people.has(key)) people.set(key, person);
      }
    }

    if (people.size === 0) {
      return Response.json(
        { error: "No Motion / Video / Ops crew found — check sheet column structure" },
        { status: 422 }
      );
    }

    // Swap out internal crew (external freelancers are preserved)
    const { error: deleteError } = await supabase
      .from("team_members")
      .delete()
      .eq("type", "internal");

    if (deleteError) {
      console.error("[sync-crew] delete error:", deleteError);
      return Response.json({ error: "Failed to clear existing crew" }, { status: 500 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("team_members")
      .insert(
        Array.from(people.values()).map((p) => ({
          name:                p.name,
          role:                p.role,
          craft:               p.craft,
          location:            p.location,
          type:                "internal",
          availability_status: "available",
          skills:              [],
        }))
      )
      .select();

    if (insertError) {
      console.error("[sync-crew] insert error:", insertError);
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    return Response.json({ synced: inserted?.length ?? 0, members: inserted });
  } catch (err) {
    console.error("[sync-crew] Error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
