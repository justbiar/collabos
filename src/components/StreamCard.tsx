"use client";

import { useState, useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { formatEther } from "viem";
import { STREAMGRANT_ABI, STREAMGRANT_ADDRESS } from "@/lib/contracts";
import { monadTestnet } from "@/lib/wagmi";
import { Droplets, Zap, Landmark, CheckCircle, PieChart } from "lucide-react";

// Tick-by-tick counter: adds effectiveFlowRate per second to accrued
function LiveAccrued({
  storedAccrued,
  lastUpdate,
  effectiveFlowRate,
}: {
  storedAccrued: bigint;
  lastUpdate: number;
  effectiveFlowRate: bigint;
}) {
  const [display, setDisplay] = useState("0.000000");
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      const now = Date.now() / 1000;
      const elapsed = Math.max(0, now - lastUpdate);
      const total = storedAccrued + BigInt(Math.floor(elapsed)) * effectiveFlowRate;
      setDisplay(Number(formatEther(total)).toFixed(6));
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [storedAccrued, lastUpdate, effectiveFlowRate]);

  return <>{display}</>;
}

export function StreamCard({
  squadId,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stream,
  accrued,
  poolBalance,
  effectiveFlowRatePerDay,
  onClaim,
}: {
  squadId: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stream: Record<string, any> | undefined;
  accrued?: bigint;
  poolBalance?: bigint;
  effectiveFlowRatePerDay: number;
  onClaim: () => void;
}) {
  const { address } = useAccount();
  const { writeContract, data: claimTxHash, isPending: isClaiming } = useWriteContract();
  const { isSuccess: claimSuccess } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  useEffect(() => {
    if (claimSuccess) onClaim();
  }, [claimSuccess, onClaim]);

  const isRecipient =
    address &&
    stream?.recipient &&
    address.toLowerCase() === stream.recipient.toLowerCase();

  const streamActive = stream?.active === true;
  const storedAccrued = stream?.storedAccrued ?? 0n;
  const lastUpdate = Number(stream?.lastUpdateTimestamp ?? 0);
  const effectiveFlowRate = stream?.effectiveFlowRate ?? 0n;

  const canClaim = isRecipient && streamActive && (accrued ?? 0n) > 0n;

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
            <Droplets size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Grant Stream
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Live MON accumulation
            </p>
          </div>
        </div>
        {streamActive ? (
          <div className="badge badge-brand">
            <div className="pulse-dot-brand" style={{ width: 6, height: 6 }} />
            Streaming
          </div>
        ) : (
          <div className="badge" style={{ background: "#f1f5f9", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            Inactive
          </div>
        )}
      </div>

      {/* Live Accrued Counter */}
      <div
        style={{
          background: "#ffffff",
          border: "2px solid #e2e8f0",
          borderRadius: 16,
          padding: "24px",
          marginBottom: 24,
          textAlign: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
        }}
      >
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, fontWeight: 700 }}>
          Accrued Balance
        </p>
        <div className="stream-counter">
          {streamActive && effectiveFlowRate > 0n ? (
            <LiveAccrued
              storedAccrued={storedAccrued}
              lastUpdate={lastUpdate}
              effectiveFlowRate={effectiveFlowRate}
            />
          ) : (
            accrued !== undefined ? Number(formatEther(accrued)).toFixed(6) : "0.000000"
          )}
        </div>
        <p
          style={{
            fontSize: "16px",
            fontWeight: 800,
            color: "var(--brand-primary)",
            marginTop: 4,
          }}
        >
          MON
        </p>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatBox
          label="Flow Rate"
          value={`${effectiveFlowRatePerDay.toFixed(4)} MON/day`}
          icon={<Zap size={16} />}
          color="var(--text-primary)"
        />
        <StatBox
          label="Pool Balance"
          value={
            poolBalance !== undefined
              ? `${Number(formatEther(poolBalance)).toFixed(3)} MON`
              : "—"
          }
          icon={<Landmark size={16} />}
          color="var(--text-primary)"
        />
        <StatBox
          label="Total Claimed"
          value={
            stream?.totalClaimed !== undefined
              ? `${Number(formatEther(stream.totalClaimed)).toFixed(4)} MON`
              : "—"
          }
          icon={<CheckCircle size={16} />}
          color="var(--text-primary)"
        />
        <StatBox
          label="Allocation"
          value={
            stream?.allocationBps !== undefined
              ? `${(Number(stream.allocationBps) / 100).toFixed(1)}%`
              : "—"
          }
          icon={<PieChart size={16} />}
          color="var(--text-primary)"
        />
      </div>

      {/* Claim Button */}
      {STREAMGRANT_ADDRESS ? (
        <button
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: "16px" }}
          disabled={!canClaim || isClaiming}
          id="claim-stream-btn"
          onClick={() => {
            writeContract({
              address: STREAMGRANT_ADDRESS,
              abi: STREAMGRANT_ABI,
              functionName: "claim",
              args: [BigInt(squadId)],
              chainId: monadTestnet.id,
            });
          }}
        >
          {isClaiming ? (
            <>
              <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>
                ⟳
              </span>{" "}
              Claiming...
            </>
          ) : claimSuccess ? (
            <>✅ Claimed Successfully!</>
          ) : (
            <>Get free demo (Claim MON)</>
          )}
        </button>
      ) : (
        <div
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "var(--text-muted)",
            padding: "16px",
            background: "var(--bg-surface-2)",
            borderRadius: 12,
            border: "1px dashed var(--border-bright)",
          }}
        >
          Deploy contracts to enable streaming
        </div>
      )}

      {!isRecipient && address && stream?.active && (
        <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", marginTop: 12, fontWeight: 500 }}>
          Only the assigned squad wallet can claim
        </p>
      )}

      {claimTxHash && (
        <a
          href={`https://testnet.monadexplorer.com/tx/${claimTxHash}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginTop: 16,
            fontSize: "12px",
            color: "#10b981",
            textDecoration: "underline",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
          }}
        >
          Tx: {claimTxHash.slice(0, 16)}… ↗
        </a>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "14px",
      }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color: "var(--text-muted)" }}>
        {icon}
        <p style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
          {label}
        </p>
      </div>
      <p style={{ fontSize: "14px", fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </p>
    </div>
  );
}
