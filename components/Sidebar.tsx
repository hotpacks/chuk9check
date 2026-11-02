export default function Sidebar() {
  const items = [
    { icon: "📰", label: "뉴스", active: true },
    { icon: "⭐", label: "내 팀", active: false },
    { icon: "🔔", label: "알림", active: false },
  ];
  return (
    <aside className="sidebar">
      <div className="logo">EPL</div>
      {items.map((i) => (
        <div key={i.label} className={`side-item ${i.active ? "active" : ""}`} title={i.active ? "" : "준비중"}>
          <span>{i.icon}</span>
          <small>{i.label}</small>
        </div>
      ))}
    </aside>
  );
}
