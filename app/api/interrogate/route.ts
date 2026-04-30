import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `You are a production coordinator assistant for Canva's Production Studio in Sydney.
Your job is to read incoming project briefs and extract structured information that producers need before scheduling a shoot or motion job.
You must respond with valid JSON only — no markdown, no prose, no code fences.
The JSON must match this exact schema:

{
  "extracted_info": {
    "project_type": "video | photo | motion | mixed | unknown",
    "deliverables": ["list of specific outputs, e.g. '1x 60s hero film', '3x social cutdowns 9:16'"],
    "deadline": "ISO date string or human-readable date, or null if not mentioned",
    "budget": "budget amount or range as a string, or null if not mentioned",
    "distribution_channels": ["e.g. 'paid social', 'YouTube', 'OOH', 'internal', 'TVC'"],
    "target_audience": "description of the intended audience, or null",
    "approver": "name or role of the person who approves the final output, or null",
    "shoot_location_preference": "e.g. 'Canva Sydney office', 'external location TBD', 'studio', or null",
    "special_requirements": ["any specific technical, talent, or logistical requirements"],
    "estimated_crew_size": "small (1-3) | medium (4-7) | large (8+) | unknown"
  },
  "gaps": [
    "Plain-English description of each critical piece of information a producer needs but that is missing from the brief"
  ]
}

Rules for gaps — only list things a producer genuinely CANNOT proceed without:
- "No deadline specified — cannot schedule shoot or post production"
- "No deliverable formats or aspect ratios provided — unclear what to produce"
- "Budget not mentioned — cannot assess crew or equipment options"
- "No approver named — unclear who signs off on the final cut"
- "Shoot location not specified — cannot assess logistics or permits"
Do NOT fabricate information. If something is genuinely unknown, use null or "unknown".
Do NOT list a gap if the information is present, even implicitly.`;

export async function POST(request: NextRequest) {
  try {
    const { briefId } = await request.json();

    if (!briefId || typeof briefId !== "string") {
      return Response.json({ error: "briefId is required" }, { status: 400 });
    }

    // Fetch the brief
    const { data: brief, error: fetchError } = await supabase
      .from("briefs")
      .select("id, title, raw_text, requester_name, requester_role, priority")
      .eq("id", briefId)
      .single();

    if (fetchError || !brief) {
      return Response.json({ error: "Brief not found" }, { status: 404 });
    }

    if (!brief.raw_text?.trim()) {
      return Response.json(
        { error: "Brief has no text to interrogate" },
        { status: 422 }
      );
    }

    // Build user message
    const userMessage = `Please analyse this production brief and extract the structured information.

Project title: ${brief.title}
Requester: ${brief.requester_name ?? "unknown"}${brief.requester_role ? ` (${brief.requester_role})` : ""}
Priority: ${brief.priority}

Brief:
${brief.raw_text}`;

    // Mock mode — set MOCK_AI=true in .env.local to skip the API and test the UI
    let parsed: { extracted_info: Record<string, unknown>; gaps: string[] };

    if (process.env.MOCK_AI === "true") {
      parsed = {
        extracted_info: {
          project_type: "video",
          deliverables: ["1x 60s hero film (9:16)", "3x 15s cutdowns for Stories"],
          deadline: null,
          budget: null,
          distribution_channels: ["Instagram", "paid social"],
          target_audience: "Canva users and potential customers interested in Create 26",
          approver: null,
          shoot_location_preference: null,
          special_requirements: ["Must showcase Create 26 highlights", "Engaging / high-energy edit"],
          estimated_crew_size: "small (1-3)",
        },
        gaps: [
          "No deadline specified — cannot schedule edit or delivery",
          "Budget not mentioned — cannot assess crew or equipment options",
          "No approver named — unclear who signs off on the final cut",
          "Shoot location not specified — is this an edit of existing footage or new shoot?",
        ],
      };
    } else {
      // Call Claude
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: userMessage },
        ],
      });

      const rawContent = message.content[0].type === "text" ? message.content[0].text : null;
      if (!rawContent) {
        throw new Error("Empty response from Claude");
      }

      // Strip markdown fences if Claude wraps the JSON
      const cleaned = rawContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
      parsed = JSON.parse(cleaned);
    }

    // Update brief in Supabase
    const { data: updated, error: updateError } = await supabase
      .from("briefs")
      .update({
        extracted_info: parsed.extracted_info,
        gaps: parsed.gaps,
        status: "in-progress",
      })
      .eq("id", briefId)
      .select()
      .single();

    if (updateError || !updated) {
      console.error("[interrogate] Supabase update error:", updateError);
      return Response.json({ error: "Failed to save results" }, { status: 500 });
    }

    return Response.json({ brief: updated });
  } catch (err) {
    console.error("[interrogate] Error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
