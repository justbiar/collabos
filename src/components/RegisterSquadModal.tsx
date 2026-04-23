"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { SQUADHUB_ABI, SQUADHUB_ADDRESS } from "@/lib/contracts";
import { monadTestnet } from "@/lib/wagmi";
import { Rocket, PartyPopper, AlertTriangle } from "lucide-react";

export function RegisterSquadModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (squadId: number) => void;
}) {
  const { address } = useAccount();
  const [name, setName] = useState("");
  const [multisig, setMultisig] = useState(address || "");
  const [githubRepo, setGithubRepo] = useState("");
  const [farcasterFid, setFarcasterFid] = useState("");
  const [error, setError] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !multisig || !githubRepo) {
      setError("Name, wallet address, and GitHub repo are required.");
      return;
    }
    if (!multisig.startsWith("0x") || multisig.length !== 42) {
      setError("Invalid wallet address.");
      return;
    }

    writeContract({
      address: SQUADHUB_ADDRESS,
      abi: SQUADHUB_ABI,
      functionName: "registerSquad",
      args: [name, multisig as `0x${string}`, githubRepo, farcasterFid || "0"],
      chainId: monadTestnet.id,
    });
  };

  if (isSuccess) {
    return (
      <ModalWrapper onClose={onClose}>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ background: "#fef3c7", padding: "16px", borderRadius: "50%", color: "#d97706" }}>
              <PartyPopper size={48} />
            </div>
          </div>
          <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.03em" }}>
            Squad Registered!
          </h3>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginBottom: 24, fontWeight: 500 }}>
            Your squad <strong>{name}</strong> is now live on Monad Testnet.
          </p>
          {txHash && (
            <a
              href={`https://testnet.monadexplorer.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="badge"
              style={{
                background: "#f1f5f9",
                color: "var(--brand-primary)",
                border: "1px solid #cbd5e1",
                textDecoration: "none",
                display: "inline-flex",
                marginBottom: 32,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                padding: "8px 16px",
                borderRadius: "12px",
              }}
            >
              View on Explorer ↗ {txHash.slice(0, 16)}…
            </a>
          )}
          <div>
            <button
              className="btn-primary"
              onClick={() => onSuccess(1)}
              id="register-success-btn"
              style={{ width: "100%", padding: "14px", fontSize: "16px" }}
            >
              View Dashboard
            </button>
          </div>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center gap-4 mb-8">
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
          <Rocket size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            Register Your Squad
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>
            Deploys a tx to SquadHub.sol on Monad Testnet
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Field label="Squad Name" required>
            <input
              id="squad-name-input"
              className="input-field"
              placeholder="e.g. ChronoTask"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label="Team Wallet (multi-sig or EOA)" required>
            <input
              id="multisig-input"
              className="input-field"
              placeholder="0x..."
              value={multisig}
              onChange={(e) => setMultisig(e.target.value)}
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "14px" }}
            />
          </Field>

          <Field label="GitHub Repository" required>
            <input
              id="github-repo-input"
              className="input-field"
              placeholder="org/repo — e.g. monadlabs/collabos"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
            />
          </Field>

          <Field label="Farcaster FID (optional)">
            <input
              id="farcaster-fid-input"
              className="input-field"
              placeholder="e.g. 12345"
              value={farcasterFid}
              onChange={(e) => setFarcasterFid(e.target.value)}
            />
          </Field>

          {error && (
            <p style={{ fontSize: "14px", color: "#b91c1c", padding: "12px 16px", background: "#fee2e2", borderRadius: 12, fontWeight: 500, border: "1px solid #fecaca" }}>
              {error}
            </p>
          )}

          <div className="flex items-center gap-4 mt-4">
            <button type="button" className="btn-secondary" onClick={onClose} id="cancel-register-btn" style={{ padding: "14px 24px", fontSize: "15px" }}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1, justifyContent: "center", padding: "14px 24px", fontSize: "15px" }}
              disabled={isPending || isConfirming || !SQUADHUB_ADDRESS}
              id="submit-register-btn"
            >
              {isPending ? (
                <>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                  Confirm in Wallet...
                </>
              ) : isConfirming ? (
                <>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
                  Confirming on Monad...
                </>
              ) : (
                <>Register Squad</>
              )}
            </button>
          </div>

          {!SQUADHUB_ADDRESS && (
            <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: "12px", color: "var(--warning)", textAlign: "center", fontWeight: 600 }}>
              <AlertTriangle size={14} /> NEXT_PUBLIC_SQUADHUB_ADDRESS not set — deploy contracts first
            </p>
          )}
        </div>
      </form>
    </ModalWrapper>
  );
}

function ModalWrapper({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
        }}
      />
      {/* Modal */}
      <div
        className="card fade-in"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 500,
          padding: "32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
          background: "#ffffff",
          borderRadius: "24px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "12px",
          fontWeight: 700,
          color: "var(--text-secondary)",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}
