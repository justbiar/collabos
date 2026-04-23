"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Landmark, Plus, Trash2, Coins, TrendingUp, Wallet } from "lucide-react";
import { platformApi, type FoundationProfile, type ScoreOverview } from "@/lib/platformApi";

function MiniGauge({ score }: { score: number }) {
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const pct = Math.min(100, score);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, height: 8, background: "var(--bg-surface-2)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", minWidth: 40 }}>
        {score}
      </span>
    </div>
  );
}

export function FoundationTab({ foundationName, foundationImage }: { foundationName?: string; foundationImage?: string }) {
  const { address } = useAccount();
  const [profile, setProfile] = useState<FoundationProfile | null>(null);
  const [overview, setOverview] = useState<ScoreOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Grant form
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [grantRecipientAddress, setGrantRecipientAddress] = useState("");
  const [grantRecipientName, setGrantRecipientName] = useState("");
  const [grantAmount, setGrantAmount] = useState("");
  const [grantDesc, setGrantDesc] = useState("");

  // Investment form
  const [showInvestForm, setShowInvestForm] = useState(false);
  const [investName, setInvestName] = useState("");
  const [investAmount, setInvestAmount] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!address) return;
      try {
        const existing = await platformApi.getFoundation(address);
        setProfile(existing);
      } catch {
        if (foundationName) {
          try {
            const created = await platformApi.upsertFoundation({
              address,
              name: foundationName,
              image: foundationImage,
            });
            setProfile(created);
          } catch {
            // backend unavailable
          }
        }
      }

      try {
        setOverview(await platformApi.getScoreOverview());
      } catch {
        // backend unavailable
      }
    };

    load();
  }, [address, foundationName, foundationImage]);

  const handleAddGrant = async () => {
    if (!profile || !grantRecipientAddress || !grantAmount) return;
    setLoading(true);
    setError("");
    try {
      const updated = await platformApi.addGrant(profile.address, {
        recipientAddress: grantRecipientAddress,
        recipientName: grantRecipientName,
        amount: parseFloat(grantAmount),
        description: grantDesc,
      });
      setProfile(updated);
      setOverview(await platformApi.getScoreOverview());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Grant save failed");
    } finally {
      setLoading(false);
    }
    setGrantRecipientAddress("");
    setGrantRecipientName("");
    setGrantAmount("");
    setGrantDesc("");
    setShowGrantForm(false);
  };

  const handleRemoveGrant = async (id: string) => {
    if (!profile) return;
    setLoading(true);
    setError("");
    try {
      const updated = await platformApi.removeGrant(profile.address, id);
      setProfile(updated);
      setOverview(await platformApi.getScoreOverview());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Grant delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvestment = async () => {
    if (!profile || !investName || !investAmount) return;
    setLoading(true);
    setError("");
    try {
      const updated = await platformApi.addInvestment(profile.address, {
        investorName: investName,
        amount: parseFloat(investAmount),
      });
      setProfile(updated);
      setOverview(await platformApi.getScoreOverview());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Investment save failed");
    } finally {
      setLoading(false);
    }
    setInvestName("");
    setInvestAmount("");
    setShowInvestForm(false);
  };

  const handleRemoveInvestment = async (id: string) => {
    if (!profile) return;
    setLoading(true);
    setError("");
    try {
      const updated = await platformApi.removeInvestment(profile.address, id);
      setProfile(updated);
      setOverview(await platformApi.getScoreOverview());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Investment delete failed");
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="card fade-in" style={{ padding: "48px", textAlign: "center" }}>
        <Wallet size={48} style={{ margin: "0 auto 16px", color: "var(--text-muted)", opacity: 0.5 }} />
        <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-secondary)" }}>Connect your wallet to get started</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {overview && (
        <div className="card" style={{ padding: "18px 24px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Ecosystem Score Overview
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Dev Avg: <strong style={{ color: "var(--text-primary)" }}>{overview.developerAverage}</strong></span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Community Avg: <strong style={{ color: "var(--text-primary)" }}>{overview.communityAverage}</strong></span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Foundation Avg: <strong style={{ color: "var(--text-primary)" }}>{overview.foundationAverage}</strong></span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total: <strong style={{ color: "var(--text-primary)" }}>{overview.ecosystemScore}</strong></span>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          {profile?.image ? (
            <img src={profile.image} alt={profile.name} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed" }}>
              <Landmark size={28} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              {profile?.name || foundationName || "Foundation"}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Foundation Dashboard</p>
          </div>
          <div className="badge badge-monad">
            <Landmark size={12} /> Foundation
          </div>
        </div>

        {/* Score */}
        {profile && (
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Foundation Score
            </p>
            <MiniGauge score={profile.score} />
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Grants: <strong style={{ color: "var(--text-primary)" }}>{profile.grants.length}</strong>
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Total MON: <strong style={{ color: "var(--text-primary)" }}>{profile.grants.reduce((a, g) => a + g.amount, 0).toFixed(2)}</strong>
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Investments: <strong style={{ color: "var(--text-primary)" }}>{profile.investments.length}</strong>
              </span>
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: "13px", color: "#991b1b", marginTop: 16 }}>
            {error}
          </div>
        )}
      </div>

      {/* Grants Section */}
      <div className="card" style={{ padding: "24px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Grants Distributed</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>MON sent to squads</p>
          </div>
          <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: "13px" }} onClick={() => setShowGrantForm(!showGrantForm)}>
            <Plus size={14} /> Add Grant
          </button>
        </div>

        {showGrantForm && (
          <div style={{ padding: "16px", background: "var(--bg-surface-2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <input className="input-field" placeholder="Recipient Community Address" value={grantRecipientAddress} onChange={(e) => setGrantRecipientAddress(e.target.value)} />
              <input className="input-field" placeholder="Recipient Name (optional)" value={grantRecipientName} onChange={(e) => setGrantRecipientName(e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 12 }}>
              <input className="input-field" placeholder="Amount (MON)" type="number" value={grantAmount} onChange={(e) => setGrantAmount(e.target.value)} />
            </div>
            <input className="input-field" placeholder="Description" value={grantDesc} onChange={(e) => setGrantDesc(e.target.value)} style={{ marginBottom: 12 }} />
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px" }} onClick={handleAddGrant} disabled={!grantRecipientAddress || !grantAmount || loading}>
              Save Grant
            </button>
          </div>
        )}

        {profile?.grants.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "14px", border: "1px dashed var(--border)", borderRadius: 10 }}>
            No grants distributed yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {profile?.grants.map((grant) => (
              <div key={grant.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--bg-surface-2)", borderRadius: 10, border: "1px solid var(--border)" }}>
                <Coins size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{grant.recipientName || grant.recipientAddress}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{grant.date} · {grant.description}</p>
                </div>
                <span className="font-mono" style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {grant.amount} MON
                </span>
                <button onClick={() => handleRemoveGrant(grant.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Investments Section */}
      <div className="card" style={{ padding: "24px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Investments Received</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>External funding rounds</p>
          </div>
          <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: "13px" }} onClick={() => setShowInvestForm(!showInvestForm)}>
            <Plus size={14} /> Add Investment
          </button>
        </div>

        {showInvestForm && (
          <div style={{ padding: "16px", background: "var(--bg-surface-2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <input className="input-field" placeholder="Investor Name" value={investName} onChange={(e) => setInvestName(e.target.value)} />
              <input className="input-field" placeholder="Amount (MON)" type="number" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} />
            </div>
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px" }} onClick={handleAddInvestment} disabled={!investName || !investAmount || loading}>
              Save Investment
            </button>
          </div>
        )}

        {profile?.investments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "14px", border: "1px dashed var(--border)", borderRadius: 10 }}>
            No investments recorded yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {profile?.investments.map((inv) => (
              <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--bg-surface-2)", borderRadius: 10, border: "1px solid var(--border)" }}>
                <TrendingUp size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{inv.investorName}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{inv.date}</p>
                </div>
                <span className="font-mono" style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {inv.amount} MON
                </span>
                <button onClick={() => handleRemoveInvestment(inv.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
