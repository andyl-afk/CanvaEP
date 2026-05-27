import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

// Maps short location codes from the sheet to full names
const LOCATION_MAP: Record<string, string> = {
  SYD: "Sydney",
  MNL: "Manila",
  MEL: "Melbourne",
  CA: "California",
  BYN: "Byron Bay",
  BYRON: "Byron Bay",
  GLD: "Gold Coast",
  TBD: "TBD",
};

// Crafts we want to import → CanvaEP craft label
const CRAFT_MAP: Record<string, string> = {
  Motion: "Motion",
  Video: "Video & Photo",
  Ops: "Producers & Ops",
};

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

export async function POST() {
  try {
    if (!SHEET_ID) {
      return Response.json({ error: "GOOGLE_SHEET_ID not configured" }, { status: 500 });
    }

    // Fetch Sheet1 as CSV via the Google Visualization API (works for public sheets)
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return Response.json(
        { error: `Could not fetch spreadsheet (${res.status})` },
        { status: 502 }
      );
    }

    const csv = await res.text();
    const rows = parseCSV(csv);

    // Each data row has: [Name, Craft, Role, Location, ...assignments]
    // We skip any row where column 1 (Craft) isn't one of our target crafts
    const people: Array<{
      name: string;
      craft: string;
      role: string;
      location: string | null;
    }> = [];

    for (const row of rows) {
      const rawCraft = row[1]?.trim() ?? "";
      const mappedCraft = CRAFT_MAP[rawCraft];
      if (!mappedCraft) continue; // skip headers, design, copy, illustration, social

      const name = row[0]?.trim() ?? "";
      if (!name || name.length < 2 || !name.includes(" ")) continue; // skip if no proper name

      const role = row[2]?.trim() ?? "";
      const locCode = row[3]?.trim().toUpperCase() ?? "";
      const location = LOCATION_MAP[locCode] ?? (locCode || null);

      people.push({ name, craft: mappedCraft, role, location });
    }

    if (people.length === 0) {
      return Response.json(
        { error: "No Motion / Video / Ops crew found in the sheet — check column structure" },
        { status: 422 }
      );
    }

    // Swap out internal crew (preserves external freelancers)
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
        people.map((p) => ({
          name: p.name,
          role: p.role,
          craft: p.craft,
          location: p.location,
          type: "internal",
          availability_status: "available",
          skills: [],
        }))
      )
      .select();

    if (insertError) {
      console.error("[sync-crew] insert error:", insertError);
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    return Response.json({
      synced: inserted?.length ?? 0,
      members: inserted,
    });
  } catch (err) {
    console.error("[sync-crew] Error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
