"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { monadTestnet } from "@/lib/wagmi";
import { SQUADHUB_ABI, SQUADHUB_ADDRESS, STREAMGRANT_ABI, STREAMGRANT_ADDRESS } from "@/lib/contracts";

import { Header, type TabId } from "@/components/Header";
import { WalletCard } from "@/components/WalletCard";
import { ReputationCard } from "@/components/ReputationCard";
import { StreamCard } from "@/components/StreamCard";
import { TxLog } from "@/components/TxLog";
import { RegisterSquadModal } from "@/components/RegisterSquadModal";
import { SquadSelector } from "@/components/SquadSelector";
import { RoleSelector, UserContextData } from "@/components/RoleSelector";
import { DeveloperTab } from "@/components/tabs/DeveloperTab";
import { CommunityTab } from "@/components/tabs/CommunityTab";
import { FoundationTab } from "@/components/tabs/FoundationTab";
import { HackathonTab } from "@/components/tabs/HackathonTab";

const ORACLE_API = process.env.NEXT_PUBLIC_ORACLE_API_URL || "http://localhost:8000";
const USER_CONTEXT_KEY_PREFIX = "collabos_user_context_";

export interface OracleScore {
  squad_id: number;
  score: number;
  technical_score: number;
  social_score: number;
  breakdown: {
    commits: number;
    merged_prs: number;
    closed_issues: number;
    casts: number;
    reactions: number;
    engagement: number;
  };
  tx_hash: string | null;
  on_chain: boolean;
}

export interface TxLogEntry {
  squad_id: number;
  old_score: number;
  new_score: number;
  new_effective_rate: string;
  oracle: string;
  timestamp: number;
  tx_hash: string;
}

export default function Dashboard() {
  const { address, isConnected, chain } = useAccount();
  const [activeSquadId, setActiveSquadId] = useState<number>(1);
  const [oracleScore, setOracleScore] = useState<OracleScore | null>(null);
  const [oracleLoading, setOracleLoading] = useState(false);
  const [txLog, setTxLog] = useState<TxLogEntry[]>([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [userContext, setUserContext] = useState<UserContextData | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const handleUserContextSelect = useCallback((data: UserContextData) => {
    setUserContext(data);
    if (typeof window !== "undefined" && address) {
      localStorage.setItem(`${USER_CONTEXT_KEY_PREFIX}${address.toLowerCase()}`, JSON.stringify(data));
    }
  }, [address]);

  // Check network
  useEffect(() => {
    if (isConnected && chain) {
      setIsWrongNetwork(chain.id !== monadTestnet.id);
    }
  }, [chain, isConnected]);

  // Restore persisted role context per wallet
  useEffect(() => {
    if (!address || typeof window === "undefined") {
      setUserContext(null);
      return;
    }

    try {
      const raw = localStorage.getItem(`${USER_CONTEXT_KEY_PREFIX}${address.toLowerCase()}`);
      if (!raw) {
        setUserContext(null);
        return;
      }
      const parsed = JSON.parse(raw) as UserContextData;
      if (parsed?.role) {
        setUserContext(parsed);
      } else {
        setUserContext(null);
      }
    } catch {
      setUserContext(null);
    }
  }, [address]);

  // ── Wallet balance ──────────────────────────────────────────────────────────
  const { data: balanceData } = useBalance({
    address,
    chainId: monadTestnet.id,
  });

  // ── Squad info from SquadHub ────────────────────────────────────────────────
  const { data: squadData, refetch: refetchSquad } = useReadContract({
    address: SQUADHUB_ADDRESS,
    abi: SQUADHUB_ABI,
    functionName: "getSquad",
    args: [BigInt(activeSquadId)],
    chainId: monadTestnet.id,
    query: { enabled: !!SQUADHUB_ADDRESS && activeSquadId > 0 },
  });

  const { data: totalSquads } = useReadContract({
    address: SQUADHUB_ADDRESS,
    abi: SQUADHUB_ABI,
    functionName: "totalSquads",
    chainId: monadTestnet.id,
    query: { enabled: !!SQUADHUB_ADDRESS },
  });

  // ── Stream data from StreamGrant ────────────────────────────────────────────
  const { data: streamData, refetch: refetchStream } = useReadContract({
    address: STREAMGRANT_ADDRESS,
    abi: STREAMGRANT_ABI,
    functionName: "getStream",
    args: [BigInt(activeSquadId)],
    chainId: monadTestnet.id,
    query: { enabled: !!STREAMGRANT_ADDRESS && activeSquadId > 0 },
  });

  const { data: accruedData, refetch: refetchAccrued } = useReadContract({
    address: STREAMGRANT_ADDRESS,
    abi: STREAMGRANT_ABI,
    functionName: "getAccrued",
    args: [BigInt(activeSquadId)],
    chainId: monadTestnet.id,
    query: { enabled: !!STREAMGRANT_ADDRESS && activeSquadId > 0 },
  });

  const { data: poolBalance, refetch: refetchPool } = useReadContract({
    address: STREAMGRANT_ADDRESS,
    abi: STREAMGRANT_ABI,
    functionName: "poolBalance",
    chainId: monadTestnet.id,
    query: { enabled: !!STREAMGRANT_ADDRESS },
  });

  const { data: scoreLogLength } = useReadContract({
    address: STREAMGRANT_ADDRESS,
    abi: STREAMGRANT_ABI,
    functionName: "scoreLogLength",
    chainId: monadTestnet.id,
    query: { enabled: !!STREAMGRANT_ADDRESS },
  });

  const { data: scoreLogData, refetch: refetchLog } = useReadContract({
    address: STREAMGRANT_ADDRESS,
    abi: STREAMGRANT_ABI,
    functionName: "getScoreLog",
    args: [0n, 20n],
    chainId: monadTestnet.id,
    query: { enabled: !!STREAMGRANT_ADDRESS && (scoreLogLength ?? 0n) > 0n },
  });

  // ── Oracle API fetch ────────────────────────────────────────────────────────
  const fetchOracleScore = useCallback(async () => {
    setOracleLoading(true);
    try {
      const res = await fetch(`${ORACLE_API}/score/${activeSquadId}`);
      if (res.ok) {
        const data = await res.json();
        setOracleScore(data);
      }
    } catch {
      // Oracle not running — graceful degradation
    } finally {
      setOracleLoading(false);
    }
  }, [activeSquadId]);

  const fetchTxLog = useCallback(async () => {
    try {
      const res = await fetch(`${ORACLE_API}/txlog?limit=20`);
      if (res.ok) {
        const data = await res.json();
        setTxLog(data.log || []);
      }
    } catch {
      // Graceful degradation — use on-chain log instead
    }
  }, []);

  // ── Polling ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOracleScore();
    fetchTxLog();
  }, [fetchOracleScore, fetchTxLog]);

  // Refetch accrued every 5 seconds for live tick
  useEffect(() => {
    const interval = setInterval(() => {
      refetchAccrued();
      refetchPool();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetchAccrued, refetchPool]);

  // Refetch score log every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchLog();
      fetchTxLog();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchLog, fetchTxLog]);

  // ── Derive display values ────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const squad = squadData as Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stream = streamData as Record<string, unknown>;

  const reputationScore =
    (stream?.reputationScore as bigint | undefined) !== undefined
      ? Number(stream.reputationScore as bigint)
      : oracleScore?.score ?? null;

  const effectiveFlowRate = (stream?.effectiveFlowRate as bigint | undefined)
    ? Number(formatEther(stream.effectiveFlowRate as bigint)) * 86400
    : 0;

  // Map on-chain log
  const onChainLog: TxLogEntry[] = (scoreLogData as Record<string, unknown>[] | undefined)?.map((e) => ({
    squad_id: Number(e.squadId as bigint),
    old_score: Number(e.oldScore as bigint),
    new_score: Number(e.newScore as bigint),
    new_effective_rate: formatEther(e.newEffectiveRate as bigint),
    oracle: e.oracle as string,
    timestamp: Number(e.timestamp as bigint),
    tx_hash: "0x" + Buffer.from((e.txHash as string).slice(2), "hex").toString("hex"),
  })) ?? [];

  const displayLog = txLog.length > 0 ? txLog : onChainLog;

  return (
    <div className="relative min-h-screen z-10">
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 pb-20">
        {/* Header */}
        <Header
          isConnected={isConnected}
          isWrongNetwork={isWrongNetwork}
          userContext={userContext}
          onRegister={() => setShowRegisterModal(true)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Wrong Network Warning */}
        {isConnected && isWrongNetwork && (
          <div
            className="fade-in mb-6 px-5 py-4 rounded-xl"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
            }}
          >
            <div className="flex items-center gap-3">
              <span style={{ fontSize: "20px" }}>⚠️</span>
              <div>
                <p style={{ color: "#f87171", fontWeight: 600, fontSize: "14px" }}>
                  Wrong Network
                </p>
                <p style={{ color: "#9090b0", fontSize: "13px" }}>
                  Please switch to <strong style={{ color: "#f0f0ff" }}>Monad Testnet</strong> (Chain ID: 10143) in your wallet.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Role Selector */}
        {address && !userContext && (
          <RoleSelector onSelect={handleUserContextSelect} />
        )}

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <>
            <SquadSelector
              activeSquadId={activeSquadId}
              totalSquads={Number(totalSquads ?? 0)}
              onSelect={setActiveSquadId}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                gap: "20px",
                alignItems: "start",
              }}
            >
              <div style={{ gridColumn: "1 / 5" }}>
                <WalletCard
                  address={address}
                  balance={balanceData ? Number(formatEther(balanceData.value)).toFixed(4) : "—"}
                  isConnected={isConnected}
                  squad={squad}
                  squadId={activeSquadId}
                />
              </div>
              <div style={{ gridColumn: "5 / 9" }}>
                <ReputationCard
                  score={reputationScore}
                  oracleScore={oracleScore}
                  loading={oracleLoading}
                  onRefresh={fetchOracleScore}
                />
              </div>
              <div style={{ gridColumn: "9 / 13" }}>
                <StreamCard
                  squadId={activeSquadId}
                  stream={stream}
                  accrued={accruedData as bigint | undefined}
                  poolBalance={poolBalance as bigint | undefined}
                  effectiveFlowRatePerDay={effectiveFlowRate}
                  onClaim={refetchStream}
                />
              </div>
              <div style={{ gridColumn: "1 / 13" }}>
                <TxLog
                  entries={displayLog}
                  onRefresh={() => { refetchLog(); fetchTxLog(); }}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === "developer" && <DeveloperTab />}
        {activeTab === "community" && <CommunityTab />}
        {activeTab === "foundation" && (
          <FoundationTab
            foundationName={userContext?.name}
            foundationImage={userContext?.image}
          />
        )}
        {activeTab === "hackathon" && (
          <HackathonTab
            userRole={userContext?.role || "developer"}
            foundationName={userContext?.name}
          />
        )}

        {/* Register Squad Modal */}
        {showRegisterModal && (
          <RegisterSquadModal
            onClose={() => setShowRegisterModal(false)}
            onSuccess={(squadId) => {
              setActiveSquadId(squadId);
              setShowRegisterModal(false);
              refetchSquad();
            }}
          />
        )}
      </div>
    </div>
  );
}
