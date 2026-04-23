"use client";

import { SQUADHUB_ADDRESS } from "@/lib/contracts";
import { Wallet, Link2, GitBranch, MessageSquare, Coins, FileCode2, ExternalLink } from "lucide-react";

function truncate(addr: string) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
}

export function WalletCard({
  address,
  balance,
  isConnected,
  squad,
  squadId,
}: {
  address?: string;
  balance: string;
  isConnected: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  squad: Record<string, any> | undefined;
  squadId: number;
}) {
  const explorerBase = "https://testnet.monadexplorer.com";

  return (
    <div className="card fade-in" style={{ padding: "24px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
            <Wallet size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Wallet Connection
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Monad Testnet status
            </p>
          </div>
        </div>
        {isConnected && (
          <div className="badge badge-success">
            <div className="pulse-dot" style={{ width: 6, height: 6, background: "currentColor" }} />
            Live
          </div>
        )}
      </div>

      {!isConnected ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: "var(--text-muted)",
            fontSize: "14px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Link2 size={40} color="var(--text-muted)" opacity={0.5} />
          </div>
          Connect your wallet to view your MON balance and squad data.
        </div>
      ) : (
        <>
          {/* Address */}
          <div className="mb-5">
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Address
            </p>
            <a
              href={`${explorerBase}/address/${address}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono"
              style={{
                fontSize: "14px",
                color: "var(--brand-primary)",
                textDecoration: "none",
                wordBreak: "break-all",
                fontWeight: 500,
              }}
            >
              {address}
            </a>
          </div>

          {/* Balance */}
          <div
            className="mb-6"
            style={{
              background: "var(--bg-surface-2)",
              borderRadius: 14,
              padding: "20px",
              border: "1px solid var(--border)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Balance
            </p>
            <div className="flex items-baseline gap-2">
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {balance}
              </span>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--brand-primary)",
                }}
              >
                MON
              </span>
            </div>
          </div>

          {/* Squad Info */}
          {squad?.active ? (
            <div
              style={{
                borderLeft: "3px solid var(--brand-primary)",
                paddingLeft: "16px",
                marginTop: "24px"
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <p style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {squad.name}
                </p>
                <div className="badge badge-brand" style={{ fontSize: "10px", padding: "2px 6px" }}>
                  Squad #{squadId}
                </div>
              </div>

              <div style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", fontWeight: 500 }}>
                <div className="flex items-center gap-1.5">
                  <GitBranch size={14} />
                  <a
                    href={`https://github.com/${squad.githubRepo}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--text-primary)", textDecoration: "underline" }}
                  >
                    {squad.githubRepo}
                  </a>
                </div>
                {squad.farcasterFID && squad.farcasterFID !== "0" && (
                  <div className="flex items-center gap-1.5">
                    <MessageSquare size={14} />
                    <span>FID: {squad.farcasterFID}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Coins size={14} />
                  <span>
                    Bounty:{" "}
                    <strong style={{ color: "var(--text-primary)", fontWeight: 800 }}>
                      {Number(squad.bountyBalance) > 0
                        ? `${(Number(squad.bountyBalance) / 1e18).toFixed(4)} MON`
                        : "0 MON"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px dashed var(--border-bright)",
                borderRadius: 14,
                padding: "20px",
                textAlign: "center",
                fontSize: "14px",
                color: "var(--text-muted)",
              }}
            >
              No active squad found for ID #{squadId}
            </div>
          )}

          {/* Contract link */}
          {SQUADHUB_ADDRESS && (
            <a
              href={`${explorerBase}/address/${SQUADHUB_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 20,
                fontSize: "12px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <FileCode2 size={14} />
              <span className="font-mono">
                SquadHub: {truncate(SQUADHUB_ADDRESS)}
              </span>
              <span style={{ marginLeft: "auto" }}>
                <ExternalLink size={14} />
              </span>
            </a>
          )}
        </>
      )}
    </div>
  );
}
