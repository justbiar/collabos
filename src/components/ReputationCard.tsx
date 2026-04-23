"use client";

import type { OracleScore } from "@/app/page";
import { Target, Code, GitMerge, Bug, MessageSquare, Heart, GitBranch, CheckCircle } from "lucide-react";

function ScoreGauge({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const dashOffset = circumference - progress;

  const color =
    score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const glowColor =
    score >= 70
      ? "rgba(16, 185, 129, 0.2)"
      : score >= 40
      ? "rgba(245, 158, 11, 0.2)"
      : "rgba(239, 68, 68, 0.2)";

  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg
        width={140}
        height={140}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx={70}
          cy={70}
          r={radius}
          fill="none"
          stroke="var(--bg-surface-2)"
          strokeWidth={12}
        />
        {/* Progress */}
        <circle
          cx={70}
          cy={70}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 1s ease, stroke 0.5s ease",
            filter: `drop-shadow(0 4px 6px ${glowColor})`,
          }}
        />
      </svg>
      {/* Score number */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "36px",
            fontWeight: 800,
            color: "var(--text-primary)",
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}
        >
          {score}
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 4, fontWeight: 600 }}>
          / 100
        </span>
      </div>
    </div>
  );
}

function BreakdownBar({
  label,
  value,
  max,
  color,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: React.ReactNode;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "var(--bg-surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color,
            }}
          >
            {icon}
          </div>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
        </div>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--text-primary)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {value.toFixed(1)}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "var(--bg-surface-2)",
          borderRadius: 9999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 9999,
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}

export function ReputationCard({
  score,
  oracleScore,
  loading,
  onRefresh,
}: {
  score: number | null;
  oracleScore: OracleScore | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  const displayScore = score ?? 0;

  return (
    <div className="card fade-in" style={{ padding: "24px" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 mt-2">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--brand-primary)",
            }}
          >
            <Target size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Reputation Score
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Updated via off-chain oracle
            </p>
          </div>
        </div>
        <button
          className="btn-secondary"
          onClick={onRefresh}
          disabled={loading}
          id="refresh-score-btn"
          style={{ padding: "8px 16px", fontSize: "13px" }}
        >
          {loading ? (
            <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
          ) : (
            "↻"
          )}{" "}
          Refresh
        </button>
      </div>

      {/* Gauge + breakdown */}
      <div className="flex items-center gap-8 mb-8">
        <ScoreGauge score={displayScore} />
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--text-secondary)",
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Score Breakdown
          </p>
          {oracleScore ? (
            <>
              <BreakdownBar
                label="Commits"
                value={oracleScore.breakdown.commits}
                max={30}
                color="#2563eb"
                icon={<Code size={14} />}
              />
              <BreakdownBar
                label="Merged PRs"
                value={oracleScore.breakdown.merged_prs}
                max={20}
                color="#3b82f6"
                icon={<GitMerge size={14} />}
              />
              <BreakdownBar
                label="Issues"
                value={oracleScore.breakdown.closed_issues}
                max={10}
                color="#60a5fa"
                icon={<Bug size={14} />}
              />
              <BreakdownBar
                label="Casts"
                value={oracleScore.breakdown.casts}
                max={20}
                color="#00c49a"
                icon={<MessageSquare size={14} />}
              />
              <BreakdownBar
                label="Reactions"
                value={oracleScore.breakdown.reactions}
                max={10}
                color="#34d399"
                icon={<Heart size={14} />}
              />
            </>
          ) : (
            <div
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                padding: "20px",
                background: "var(--bg-surface-2)",
                borderRadius: 12,
                textAlign: "center",
                border: "1px dashed var(--border-bright)",
              }}
            >
              {loading ? "Computing score..." : "No score data yet — Oracle may not be running"}
            </div>
          )}
        </div>
      </div>

      {/* Source tags */}
      <div className="flex items-center gap-2 flex-wrap pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="badge badge-brand">
          <GitBranch size={12} style={{ marginRight: 4 }} /> GitHub 60%
        </div>
        <div className="badge badge-monad">
          <MessageSquare size={12} style={{ marginRight: 4 }} /> Farcaster 40%
        </div>
        {oracleScore?.on_chain && (
          <div className="badge badge-success">
            <CheckCircle size={12} style={{ marginRight: 4 }} /> On-chain
          </div>
        )}
        {oracleScore?.tx_hash && (
          <a
            href={`https://testnet.monadexplorer.com/tx/${oracleScore.tx_hash}`}
            target="_blank"
            rel="noreferrer"
            className="badge"
            style={{
              background: "#f1f5f9",
              color: "#475569",
              border: "1px solid #cbd5e1",
              textDecoration: "none",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
            }}
          >
            tx: {oracleScore.tx_hash.slice(0, 10)}…↗
          </a>
        )}
      </div>
    </div>
  );
}
