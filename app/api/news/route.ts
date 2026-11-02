import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";
const FILE = path.join(process.cwd(), "data", "news.json");
const MY_TEAM_BONUS_HOURS = 12; // 내 팀 기사에 "12시간 더 최신인 것처럼" 가산

type Row = {
  id: string; url: string; source: string; title_ko: string; summary_ko: string;
  category: string; teams: string[]; published_at: string;
};

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const teams = (sp.get("teams") ?? "").split(",").filter(Boolean);
  const mode = sp.get("mode") === "mine" ? "mine" : "all";
  const limit = Math.min(Number(sp.get("limit")) || 30, 100);

  let data: { updated_at: string | null; items: Row[] } = { updated_at: null, items: [] };
  try {
    data = JSON.parse(await readFile(FILE, "utf8"));
  } catch {}

  let rows = data.items;
  if (mode === "mine") {
    if (!teams.length) return NextResponse.json({ updated_at: data.updated_at, items: [] });
    rows = rows.filter((r) => r.teams.some((t) => teams.includes(t)));
  }

  const now = Date.now();
  const items = rows.map((r) => {
    const mine = r.teams.some((t) => teams.includes(t));
    const ageH = (now - Date.parse(r.published_at)) / 3.6e6;
    return { ...r, mine, score: -ageH + (mine ? MY_TEAM_BONUS_HOURS : 0) };
  });
  if (mode === "all") items.sort((a, b) => b.score - a.score);

  return NextResponse.json({ updated_at: data.updated_at, items: items.slice(0, limit) });
}
