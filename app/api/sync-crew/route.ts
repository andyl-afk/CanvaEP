import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

const LOCATION_MAP: Record<string, string> = {
  SYD: "Sydney", MNL: "Manila", MEL: "Melbourne",
  CA: "California", BYN: "Byron Bay", BYRON: "Byron Bay",
  GLD: "Gold Coast", TBD: "TBD",
};
const VALID_LOCATIONS = new Set(Object.keys(LOCATION_MAP));

const CRAFT_MAP: Record<string, string> = {
  Motion: "Motion",
  Video:  "Video & Photo",
  Ops:    "Producers & Ops",
};

const SKIP_NAME_KEYWORDS = ["hiring", "open", "tbd", "n/a", "vacant", "role", "position"];

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

// ── Helpers ───────────────────────────────────────────────

function isValidPersonName(name: string): boolean {
  if (!name || name.length < 4 || name.length > 45) return false;
  if (!name.includes(" ")) return false;
  if (name === name.toUpperCase() && name.length > 5) return false;
  if (!/^[A-Z]/.test(name)) return false;
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

// Parse a week header like "w/c 18 May – 22 May" or "w/c 25-29 May"
function parseWeekStart(cell: string): Date | null {
  const dayMatch = cell.match(/w\/c\s+(\d{1,2})/i);
  const monthMatch = cell.match(/\b([A-Za-z]{3,})\b/);
  if (!dayMatch || !monthMatch) return null;
  const day = parseInt(dayMatch[1]);
  const month = MONTHS[monthMatch[1].toLowerCase().slice(0, 3)];
  if (month === undefined) return null;
  return new Date(new Date().getFullYear(), month, day);
}

// Find the first column index for the current week's schedule data
function getCurrentWeekStartCol(headerRow: string[]): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));

  let bestCol = 5; // fallback to first data column

  for (let col = 5; col < headerRow.length; col++) {
    const cell = headerRow[col]?.trim() ?? "";
    if (!cell.toLowerCase().startsWith("w/c")) continue;
    const weekStart = parseWeekStart(cell);
    if (!weekStart) continue;
    if (weekStart <= monday) bestCol = col; // keep advancing until we pass today
    if (weekStart > monday) break;
  }

  return bestCol;
}

type AvailStatus = "available" | "busy" | "unavailable";

// Determine availability from a person's AM+PM rows for the current week's columns
function determineAvailability(
  amRow: string[],
  pmRow: string[],
  weekStartCol: number
): AvailStatus {
  const cells: string[] = [];
  for (let c = weekStartCol; c < weekStartCol + 5 && c < amRow.length; c++) {
    cells.push((amRow[c] ?? "").trim(), (pmRow[c] ?? "").trim());
  }

  const nonEmpty = cells.filter(Boolean);
  if (nonEmpty.length === 0) return "available";

  const upper = nonEmpty.map((c) => c.toUpperCase());
  const allPH = upper.every((c) => c === "PH"); // public holiday only = free
  if (allPH) return "available";

  const hasAL = upper.some((c) => c === "AL" || c.includes("ANNUAL LEAVE"));
  const hasWork = nonEmpty.some((c) => !["AL", "PH"].includes(c.toUpperCase()));

  if (hasAL && !hasWork) return "unavailable";
  return "busy";
}

// ── Data extraction ───────────────────────────────────────

type Person = {
  name: string;
  craft: string;
  role: string;
  location: string | null;
  availability: AvailStatus;
};

function extractPeople(rows: string[][], weekStartCol: number): Map<string, Person> {
  const people = new Map<string, Person>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name       = row[0]?.trim() ?? "";
    const rawCraft   = row[1]?.trim() ?? "";
    const role       = row[2]?.trim() ?? "";
    const locCode    = row[3]?.trim().toUpperCase() ?? "";
    const timePeriod = row[4]?.trim() ?? "";

    if (timePeriod !== "AM") continue;
    if (!isValidPersonName(name)) continue;

    const mappedCraft = CRAFT_MAP[rawCraft];
    if (!mappedCraft) continue;
    if (!VALID_LOCATIONS.has(locCode)) continue;

    const pmRow = rows[i + 1] ?? [];
    const availability = determineAvailability(row, pmRow, weekStartCol);

    const key = name.toLowerCase().replace(/\s+/g, " ");
    if (!people.has(key)) {
      people.set(key, {
        name,
        craft: mappedCraft,
        role,
        location: LOCATION_MAP[locCode] ?? null,
        availability,
      });
    }
  }

  return people;
}

async function fetchSheetRows(gid: string): Promise<string[][] | null> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return parseCSV(await res.text());
}

// ── Route handler ─────────────────────────────────────────

export async function POST() {
  try {
    if (!SHEET_ID) {
      return Response.json({ error: "GOOGLE_SHEET_ID not configured" }, { status: 500 });
    }

    // Fetch both sheet tabs in parallel
    const [rows0, rows1] = await Promise.all([
      fetchSheetRows("0"),
      fetchSheetRows("1"),
    ]);

    if (!rows0 && !rows1) {
      return Response.json({ error: "Could not fetch spreadsheet" }, { status: 502 });
    }

    // Determine current week's column offset from the header row
    const headerRow = (rows0 ?? rows1)![0] ?? [];
    const weekStartCol = getCurrentWeekStartCol(headerRow);

    // Merge people from both tabs — first occurrence wins
    const people = new Map<string, Person>();
    for (const rows of [rows0, rows1]) {
      if (!rows) continue;
      for (const [key, person] of extractPeople(rows, weekStartCol)) {
        if (!people.has(key)) people.set(key, person);
      }
    }

    if (people.size === 0) {
      return Response.json({ error: "No Motion / Video / Ops crew found in sheet" }, { status: 422 });
    }

    // ── Smart upsert: update existing, insert new, remove stale ──
    const { data: existing } = await supabase
      .from("team_members")
      .select("id, name")
      .eq("type", "internal");

    const existingByName = new Map(
      (existing ?? []).map((m) => [m.name.toLowerCase().replace(/\s+/g, " "), m.id as string])
    );

    const sheetKeys = new Set(people.keys());
    const toInsert: object[] = [];
    const updatePromises: Promise<unknown>[] = [];

    for (const [key, p] of people) {
      const id = existingByName.get(key);
      if (id) {
        // Update role, craft, location, and availability — preserves avatar_url, notes, skills
        updatePromises.push(
          Promise.resolve(
            supabase.from("team_members").update({
              role:                p.role,
              craft:               p.craft,
              location:            p.location,
              availability_status: p.availability,
            }).eq("id", id)
          )
        );
      } else {
        toInsert.push({
          name:                p.name,
          role:                p.role,
          craft:               p.craft,
          location:            p.location,
          type:                "internal",
          availability_status: p.availability,
          skills:              [],
        });
      }
    }

    // Remove anyone in Supabase who's no longer in the sheet
    const staleIds = [...existingByName.entries()]
      .filter(([key]) => !sheetKeys.has(key))
      .map(([, id]) => id);

    await Promise.all([
      ...updatePromises,
      toInsert.length > 0
        ? supabase.from("team_members").insert(toInsert)
        : Promise.resolve(),
      staleIds.length > 0
        ? supabase.from("team_members").delete().in("id", staleIds)
        : Promise.resolve(),
    ]);

    return Response.json({
      synced:   people.size,
      updated:  updatePromises.length,
      inserted: toInsert.length,
      removed:  staleIds.length,
      weekCol:  weekStartCol, // useful for debugging
    });
  } catch (err) {
    console.error("[sync-crew] Error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
