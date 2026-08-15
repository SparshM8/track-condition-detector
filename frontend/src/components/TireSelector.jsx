const TIRES = [
  { key: "Dry", name: "Slick", color: "#e11d2e", desc: "Full dry grip" },
  { key: "Drying", name: "Medium", color: "#f4c430", desc: "Transitional" },
  { key: "Damp", name: "Intermediate", color: "#22c55e", desc: "Light wet" },
  { key: "Wet", name: "Full Wet", color: "#3b82f6", desc: "Heavy wet" },
];

function TireIcon({ color, active }) {
  return (
    <svg width={active ? 56 : 44} height={active ? 56 : 44} viewBox="0 0 64 64" style={{ transition: "all 300ms ease" }}>
      <circle cx="32" cy="32" r="30" fill="#111" stroke={active ? color : "#333"} strokeWidth={active ? 4 : 2} />
      <circle cx="32" cy="32" r="20" fill="none" stroke={active ? color : "#444"} strokeWidth="3" strokeDasharray="4 3" />
      <circle cx="32" cy="32" r="9" fill={active ? color : "#2a2a2a"} />
      {active && (
        <circle cx="32" cy="32" r="30" fill="none" stroke={color} strokeWidth="2" opacity="0.5">
          <animate attributeName="r" values="26;34;26" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="1.8s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

export default function TireSelector({ trend }) {
  const activeLabel = trend?.latestLabel;

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="card-title">Recommended Tire Compound</div>
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginTop: 8 }}>
        {TIRES.map((tire) => {
          const isActive = tire.key === activeLabel;
          return (
            <div
              key={tire.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                opacity: activeLabel ? (isActive ? 1 : 0.35) : 0.6,
                transition: "opacity 300ms ease",
              }}
            >
              <TireIcon color={tire.color} active={isActive} />
              <div
                style={{
                  fontSize: isActive ? 13 : 11,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? tire.color : "#8b97a8",
                  letterSpacing: "0.02em",
                }}
              >
                {tire.name}
              </div>
              {isActive && (
                <div style={{ fontSize: 10, color: "#8b97a8" }}>{tire.desc}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}