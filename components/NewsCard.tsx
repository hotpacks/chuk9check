import { SOURCE_BY_ID } from "@/lib/sources";
import { TEAM_BY_ID } from "@/lib/teams";

export type Item = {
  id: string;
  url: string;
  source: string;
  title_ko: string;
  summary_ko: string | null;
  category: string;
  teams: string[];
  published_at: string;
  mine: boolean;
};

export function timeAgo(iso: string) {
  const m = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  if (m < 1440) return `${Math.floor(m / 60)}시간 전`;
  return `${Math.floor(m / 1440)}일 전`;
}

export default function NewsCard({ item }: { item: Item }) {
  const src = SOURCE_BY_ID[item.source];
  return (
    <a className={`card ${item.mine ? "mine" : ""}`} href={item.url} target="_blank" rel="noopener noreferrer">
      <div className="card-top">
        <div className="meta">
          <span className="badge" style={{ background: src?.color ?? "#444" }}>{src?.name ?? item.source}</span>
          <span>·</span>
          <span>{item.category}</span>
        </div>
        <span className="time">{timeAgo(item.published_at)}</span>
      </div>
      <div className="title">{item.title_ko}</div>
      {item.summary_ko && <div className="summary">{item.summary_ko}</div>}
      <div className="tags">
        {item.teams.map((t) => (
          <span key={t} className="tag">{TEAM_BY_ID[t]?.ko ?? t}</span>
        ))}
      </div>
    </a>
  );
}
