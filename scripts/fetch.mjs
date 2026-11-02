// RSS 수집 + 규칙 기반 EPL 후보 필터 → data/inbox.json  (LLM 호출 없음)
// 이후 Claude Code가 /update-news 로 inbox를 분류·번역해 data/news.json 에 반영한다.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import Parser from "rss-parser";

const read = (p, fallback) => {
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return fallback; }
};
const write = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + "\n");

const MAX_AGE_MS = 48 * 3600 * 1000;       // 수집 대상: 48시간 이내 기사
const KEEP_NEWS_MS = 14 * 24 * 3600 * 1000; // news.json 보관: 14일
const KEEP_SEEN_MS = 7 * 24 * 3600 * 1000;  // 제외 URL 기억: 7일
const MAX_INBOX = 40;                       // 1회 처리량 상한

const teams = read("data/teams.json", []);
const sources = read("data/sources.json", []);
const news = read("data/news.json", { updated_at: null, items: [] });
let seen = read("data/seen.json", []);

const now = Date.now();
news.items = news.items.filter((i) => now - Date.parse(i.published_at) < KEEP_NEWS_MS);
seen = seen.filter((s) => now - Date.parse(s.ts) < KEEP_SEEN_MS);

const known = new Set([...news.items.map((i) => i.url), ...seen.map((s) => s.url)]);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isAscii = (s) => /^[\x00-\x7f]+$/.test(s);
function candidates(text) {
  const lower = text.toLowerCase();
  return teams
    .filter((t) =>
      t.aliases.some((a) =>
        isAscii(a) ? new RegExp(`\\b${esc(a.toLowerCase())}\\b`).test(lower) : lower.includes(a.toLowerCase())
      )
    )
    .map((t) => t.id);
}

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; chuk9check/0.1)" },
});

const found = new Map();
for (const s of sources) {
  for (const url of s.feeds) {
    try {
      const feed = await parser.parseURL(url);
      for (const it of feed.items) {
        const link = it.link?.trim();
        const title = it.title?.trim();
        if (!link || !title || known.has(link)) continue;
        const ts = Date.parse(it.isoDate ?? it.pubDate ?? "") || now;
        if (now - ts > MAX_AGE_MS) continue;
        const snippet = (it.contentSnippet ?? it.summary ?? "").replace(/\s+/g, " ").slice(0, 400);
        const cands = candidates(`${title} ${snippet}`);
        if (!cands.length) continue; // EPL 팀명이 전혀 없으면 버림
        const id = createHash("sha1").update(link).digest("hex").slice(0, 10);
        if (!found.has(id))
          found.set(id, { id, url: link, source: s.id, title_orig: title, snippet, published_at: new Date(ts).toISOString(), candidates: cands });
      }
      console.log(`✓ ${s.id} ${url}`);
    } catch (e) {
      console.error(`✗ ${s.id} ${url} — ${e.message}`);
    }
  }
}

const items = [...found.values()]
  .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))
  .slice(0, MAX_INBOX);

write("data/news.json", news);
write("data/seen.json", seen);
write("data/inbox.json", { generated_at: new Date().toISOString(), items });
console.log(`\ninbox: ${items.length}건 (처리 대기)`);
