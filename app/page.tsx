"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import NewsCard, { Item, timeAgo } from "@/components/NewsCard";
import TeamPicker from "@/components/TeamPicker";
import { TEAM_BY_ID } from "@/lib/teams";

const TABS = ["전체", "속보", "이적", "부상·라인업", "경기", "분석"];
const LS_KEY = "chuk9check:teams";

export default function Home() {
  const [myTeams, setMyTeams] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mode, setMode] = useState<"all" | "mine">("all");
  const [tab, setTab] = useState("전체");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(30);
  const [items, setItems] = useState<Item[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 내 구단 로드 (없으면 최초 방문으로 보고 설정창 오픈)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) ?? "null");
      if (Array.isArray(saved) && saved.length) setMyTeams(saved);
      else setPickerOpen(true);
    } catch {
      setPickerOpen(true);
    }
    setReady(true);
  }, []);

  const updateTeams = (ids: string[]) => {
    setMyTeams(ids);
    try { localStorage.setItem(LS_KEY, JSON.stringify(ids)); } catch {}
  };

  const load = useCallback(async () => {
    const r = await fetch(`/api/news?mode=${mode}&teams=${myTeams.join(",")}&limit=${limit}`);
    const j = await r.json();
    setItems(j.items ?? []);
    setUpdatedAt(j.updated_at ?? null);
    setLoading(false);
  }, [mode, myTeams, limit]);

  useEffect(() => {
    if (!ready) return;
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [ready, load]);

  const shown = useMemo(
    () =>
      items.filter(
        (i) => (tab === "전체" || i.category === tab) && (!q || i.title_ko.includes(q) || (i.summary_ko ?? "").includes(q))
      ),
    [items, tab, q]
  );

  return (
    <div className="col">
      <h1 className="brand">
        <img className="brand-logo" src="/logo.png" alt="" width={28} height={28} />
        축구체크<small>EPL 팀별 뉴스</small>
      </h1>

      <input className="search" placeholder="검색어를 입력하세요" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="myteams">
        <span className="muted">내 구단</span>
        {myTeams.length === 0 && <span className="muted">미설정</span>}
        {myTeams.map((t) => (
          <span key={t} className="tag on">{TEAM_BY_ID[t]?.ko}</span>
        ))}
        <button className="btn" onClick={() => setPickerOpen((v) => !v)}>설정</button>
        <span className="muted right">{updatedAt ? `마지막 업데이트 ${timeAgo(updatedAt)}` : "업데이트 이력 없음"}</span>
      </div>

      {pickerOpen && <TeamPicker selected={myTeams} onChange={updateTeams} onClose={() => setPickerOpen(false)} />}

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="pills">
        <button className={`pill ${mode === "all" ? "on" : ""}`} onClick={() => setMode("all")}>전체 (내 팀 우선)</button>
        <button className={`pill ${mode === "mine" ? "on" : ""}`} onClick={() => setMode("mine")}>내 팀만</button>
      </div>

      <div className="feed">
        {loading && <div className="empty">불러오는 중…</div>}
        {!loading && shown.length === 0 && (
          <div className="empty">아직 뉴스가 없습니다. Claude Code에서 <code>/update-news</code> 를 실행하세요.</div>
        )}
        {shown.map((i) => <NewsCard key={i.id} item={i} />)}
      </div>

      {items.length >= limit && (
        <button className="more" onClick={() => setLimit((l) => l + 30)}>더 보기</button>
      )}
    </div>
  );
}
