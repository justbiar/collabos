"use client";

export function SquadSelector({
  activeSquadId,
  totalSquads,
  onSelect,
}: {
  activeSquadId: number;
  totalSquads: number;
  onSelect: (id: number) => void;
}) {
  const count = Math.max(totalSquads, 1); // show at least squad #1

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
          Active Squad
        </p>
        {totalSquads > 0 && (
          <div className="badge" style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" }}>
            {totalSquads} registered
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {Array.from({ length: count }, (_, i) => i + 1).map((id) => (
          <button
            key={id}
            id={`squad-tab-${id}`}
            onClick={() => onSelect(id)}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              border: "1px solid",
              borderColor: activeSquadId === id ? "var(--brand-primary)" : "var(--border)",
              background:
                activeSquadId === id
                  ? "#eff6ff"
                  : "var(--bg-surface)",
              color: activeSquadId === id ? "var(--brand-primary)" : "var(--text-secondary)",
              fontWeight: activeSquadId === id ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: activeSquadId === id ? "0 4px 12px rgba(37, 99, 235, 0.1)" : "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            Squad #{id}
          </button>
        ))}
        {/* Manual input */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
          <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>or ID:</span>
          <input
            type="number"
            min={1}
            defaultValue={activeSquadId}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (v > 0) onSelect(v);
            }}
            className="input-field"
            style={{ width: 80, padding: "8px 12px", fontSize: "14px", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)" }}
            id="squad-id-input"
          />
        </div>
      </div>
    </div>
  );
}
