// data/news.json · seen.json 형식 검증 (분류 결과를 커밋하기 전에 실행)
import { readFileSync } from "node:fs";

const CATS = ["속보", "이적", "부상·라인업", "경기", "분석", "기타"];
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const teamIds = new Set(read("data/teams.json").map((t) => t.id));
const sourceIds = new Set(read("data/sources.json").map((s) => s.id));
const news = read("data/news.json");
const inbox = read("data/inbox.json");
const seen = read("data/seen.json");

const errors = [];
const err = (m) => errors.push(m);

if (!Array.isArray(news.items)) err("news.items 가 배열이 아님");
const ids = new Set(), urls = new Set();

for (const [n, i] of (news.items ?? []).entries()) {
  const w = `items[${n}](${i.id})`;
  for (const k of ["id", "url", "source", "title_orig", "title_ko", "summary_ko", "category", "teams", "published_at"])
    if (i[k] === undefined || i[k] === "") err(`${w}: ${k} 누락`);
  if (ids.has(i.id)) err(`${w}: id 중복`);
  if (urls.has(i.url)) err(`${w}: url 중복`);
  ids.add(i.id); urls.add(i.url);
  if (!sourceIds.has(i.source)) err(`${w}: 알 수 없는 source ${i.source}`);
  if (!CATS.includes(i.category)) err(`${w}: category 오류 ${i.category}`);
  if (!Array.isArray(i.teams) || i.teams.length < 1 || i.teams.length > 3) err(`${w}: teams 는 1~3개`);
  else for (const t of i.teams) if (!teamIds.has(t)) err(`${w}: 알 수 없는 팀 id ${t}`);
  if (Number.isNaN(Date.parse(i.published_at))) err(`${w}: published_at 날짜 오류`);
  if ((i.summary_ko ?? "").length > 220) err(`${w}: summary_ko 가 너무 김 (≤220자, 1~2문장)`);
}
for (const s of seen) if (!s.url || Number.isNaN(Date.parse(s.ts))) err(`seen 항목 오류: ${JSON.stringify(s)}`);
if (inbox.items?.length) err(`inbox 에 미처리 ${inbox.items.length}건이 남아 있음 (처리 후 items 를 비우세요)`);

if (errors.length) {
  console.error(errors.map((e) => "✗ " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ OK — news ${news.items.length}건, seen ${seen.length}건`);
