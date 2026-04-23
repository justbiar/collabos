"use client";

import type { TxLogEntry } from "@/app/page";
import { ClipboardList, Inbox, Link2, XCircle, TrendingUp, TrendingDown } from "lucide-react";

const EXPLORER = "https://testnet.monadexplorer.com";

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function ScoreDelta({ from, to }: { from: number; to: number }) {
  const delta = to - from;
  const up = delta > 0;
  const color = up ? "#10b981" : delta < 0 ? "#ef4444" : "#64748b";
  return (
    <div className="flex items-center gap-2">
      <span
        style={{
          fontSize: "13px",
          color: "var(--text-muted)",
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
        }}
      >
        {from}
      </span>
      <span style={{ color: "var(--text-muted)" }}>→</span>
      <span
        style={{
          fontSize: "15px",
          fontWeight: 800,
          color,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {to}
      </span>
      {delta !== 0 && (
        <span
          style={{
            fontSize: "12px",
            color,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(delta)}
        </span>
      )}
    </div>
  );
}

export function TxLog({
  entries,
  onRefresh,
}: {
  entries: TxLogEntry[];
  onRefresh: () => void;
}) {
  return (
    <div className="card fade-in" style={{ padding: "24px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--brand-primary)",
            }}
          >
            <ClipboardList size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Oracle Transaction Log
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>
              On-chain reputation score updates from the oracle
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="badge badge-brand">
            {entries.length} entries
          </div>
          <button
            className="btn-secondary"
            onClick={onRefresh}
            id="refresh-txlog-btn"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            color: "var(--text-muted)",
            fontSize: "14px",
            background: "var(--bg-surface-2)",
            borderRadius: 16,
            border: "1px dashed var(--border-bright)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Inbox size={40} color="var(--text-muted)" opacity={0.5} />
          </div>
          <p style={{ fontWeight: 600, marginBottom: 4, color: "var(--text-secondary)" }}>
            No oracle transactions yet
          </p>
          <p>
            Start the Oracle agent and trigger a score update to see real Monad Testnet transactions here.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
            gap: 16,
          }}
        >
          {entries.map((entry, i) => (
            <TxEntry key={i} entry={entry} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function TxEntry({ entry, index }: { entry: TxLogEntry; index: number }) {
  const hashStr =
    entry.tx_hash && entry.tx_hash !== "null"
      ? entry.tx_hash
      : null;

  return (
    <div
      className="slide-in"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "16px 20px",
        animationDelay: `${index * 0.05}s`,
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-brand)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)";
      }}
    >
      {/* Top row: squad + time */}
      <div className="flex items-center justify-between mb-4">
        <div className="badge" style={{ background: "#fef3c7", color: "#b45309", border: "none" }}>Squad #{entry.squad_id}</div>
        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
          {entry.timestamp ? timeAgo(entry.timestamp) : "—"}
        </span>
      </div>

      {/* Score delta */}
      <div className="mb-4">
        <p style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, fontWeight: 600 }}>
          Score Update
        </p>
        <ScoreDelta from={entry.old_score} to={entry.new_score} />
      </div>

      {/* Tx hash */}
      {hashStr ? (
        <a
          href={`${EXPLORER}/tx/${hashStr}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            padding: "8px 12px",
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 10,
          }}
        >
          <Link2 size={12} color="var(--text-muted)" />
          <span
            className="font-mono"
            style={{ fontSize: "12px", color: "var(--brand-primary)", flex: 1, fontWeight: 600 }}
          >
            {hashStr.slice(0, 22)}…{hashStr.slice(-6)}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>↗</span>
        </a>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: 10,
            fontSize: "12px",
            color: "#b91c1c",
            fontWeight: 600,
          }}
        >
          <XCircle size={14} /> Tx failed
        </div>
      )}

      {/* Oracle address */}
      {entry.oracle && (
        <p
          className="font-mono"
          style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 12, textAlign: "right" }}
        >
          Oracle: {entry.oracle.slice(0, 8)}…{entry.oracle.slice(-6)}
        </p>
      )}
    </div>
  );
}
