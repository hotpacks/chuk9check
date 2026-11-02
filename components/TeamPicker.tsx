"use client";
import { TEAMS } from "@/lib/teams";

export default function TeamPicker({
  selected,
  onChange,
  onClose,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  onClose: () => void;
}) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div className="picker">
      <div className="picker-head">
        <b>내 구단 설정</b>
        <button className="btn" onClick={onClose}>완료</button>
      </div>
      <p className="muted">선택한 팀의 소식이 피드 상단에 우선 노출됩니다. (여러 팀 선택 가능)</p>
      <div className="chips">
        {TEAMS.map((t) => (
          <button key={t.id} className={`chip ${selected.includes(t.id) ? "on" : ""}`} onClick={() => toggle(t.id)}>
            {t.ko}
          </button>
        ))}
      </div>
    </div>
  );
}
