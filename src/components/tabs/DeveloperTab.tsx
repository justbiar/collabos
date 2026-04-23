"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Code2, GitBranch, MessageSquare, Search, Loader2, Star, Users, GitMerge, Bug, Heart, Wallet } from "lucide-react";
import { platformApi, type DeveloperProfile, type ScoreOverview } from "@/lib/platformApi";

// ─── Score Gauge ─────────────────────────────────────────────────────────────
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

// ─── Stat Item ───────────────────────────────────────────────────────────────
function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ color: "var(--text-muted)" }}>{icon}</div>
      <span style={{ fontSize: "13px", color: "var(--text-secondary)", flex: 1 }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

// ─── Developer Tab ───────────────────────────────────────────────────────────
export function DeveloperTab() {
  const { address } = useAccount();
  const [githubUsername, setGithubUsername] = useState("");
  const [farcasterFid, setFarcasterFid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [overview, setOverview] = useState<ScoreOverview | null>(null);
  const [githubAvatar, setGithubAvatar] = useState("");
  const [githubName, setGithubName] = useState("");
  const [githubBio, setGithubBio] = useState("");

  // Load existing profile
  useEffect(() => {
    const load = async () => {
      if (!address) return;
      try {
        const existing = await platformApi.getDeveloper(address);
        setProfile(existing);
        setGithubUsername(existing.githubUsername);
        setFarcasterFid(existing.farcasterFid);
        setGithubAvatar(existing.githubMeta?.avatarUrl || "");
        setGithubName(existing.githubMeta?.name || existing.githubUsername);
        setGithubBio(existing.githubMeta?.bio || "");
      } catch {
        // first registration
      }
      try {
        const scoreOverview = await platformApi.getScoreOverview();
        setOverview(scoreOverview);
      } catch {
        // backend might be offline
      }
    };
    load();
  }, [address]);

  const handleCalculate = async () => {
    if (!address || !githubUsername) return;
    setLoading(true);
    setError("");
    try {
      const newProfile = await platformApi.registerDeveloper({
        address,
        githubUsername,
        farcasterFid,
      });
      setGithubAvatar(newProfile.githubMeta?.avatarUrl || "");
      setGithubName(newProfile.githubMeta?.name || newProfile.githubUsername);
      setGithubBio(newProfile.githubMeta?.bio || "");
      setProfile(newProfile);
      const scoreOverview = await platformApi.getScoreOverview();
      setOverview(scoreOverview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
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

      {/* Registration Form */}
      <div className="card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4, letterSpacing: "-0.03em" }}>
          Developer Profile
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: 24 }}>
          Connect your GitHub and Farcaster to calculate your builder score
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <GitBranch size={12} /> GitHub Username
            </label>
            <input
              className="input-field"
              placeholder="e.g. vitalik"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <MessageSquare size={12} /> Farcaster FID
            </label>
            <input
              className="input-field"
              placeholder="e.g. 3621"
              value={farcasterFid}
              onChange={(e) => setFarcasterFid(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "8px 12px", background: "var(--bg-surface-2)", borderRadius: 8, border: "1px solid var(--border)" }}>
          <Wallet size={14} style={{ color: "var(--text-muted)" }} />
          <span className="font-mono" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{address}</span>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: "13px", color: "#991b1b", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={handleCalculate}
          disabled={loading || !githubUsername}
        >
          {loading ? (
            <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Fetching data...</>
          ) : (
            <><Search size={16} /> Calculate Score</>
          )}
        </button>
      </div>

      {/* Profile Results */}
      {profile && profile.githubData && (
        <div className="card" style={{ padding: "24px" }}>
          {/* Profile Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            {githubAvatar && (
              <img src={githubAvatar} alt={githubUsername} style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid var(--border)" }} />
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>{githubName || githubUsername}</h3>
              {githubBio && <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: 2 }}>{githubBio}</p>}
            </div>
            <div className="badge badge-brand" style={{ fontSize: "11px" }}>
              <Code2 size={12} /> Developer
            </div>
          </div>

          {/* Score */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Builder Score
            </p>
            <MiniGauge score={profile.score} />
          </div>

          {/* GitHub Stats */}
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              GitHub Activity
            </p>
            <StatItem icon={<Code2 size={14} />} label="Commits (recent)" value={profile.githubData.commits} />
            <StatItem icon={<GitMerge size={14} />} label="Merged PRs" value={profile.githubData.mergedPrs} />
            <StatItem icon={<Bug size={14} />} label="Closed Issues" value={profile.githubData.closedIssues} />
            <StatItem icon={<Star size={14} />} label="Total Stars" value={profile.githubData.stars} />
            <StatItem icon={<Users size={14} />} label="Public Repos" value={profile.githubData.repos} />
          </div>

          {/* Farcaster Stats */}
          {profile.farcasterData && (
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 16, marginBottom: 4 }}>
                Farcaster Activity
              </p>
              <StatItem icon={<MessageSquare size={14} />} label="Casts" value={profile.farcasterData.casts} />
              <StatItem icon={<Heart size={14} />} label="Reactions" value={profile.farcasterData.reactions} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
