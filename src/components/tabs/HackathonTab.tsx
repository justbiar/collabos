"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Bot, Trophy, Plus, Send, Loader2, Key, Coins, FileText, Users, Crown, Wallet, Sparkles } from "lucide-react";
import { platformApi, type Hackathon } from "@/lib/platformApi";

// ─── Hackathon Tab ──────────────────────────────────────────────────────────
export function HackathonTab({ userRole, foundationName }: { userRole: string; foundationName?: string }) {
  const { address } = useAccount();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<string | null>(null);

  // Foundation: create hackathon
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hName, setHName] = useState("");
  const [hDesc, setHDesc] = useState("");
  const [hPrize, setHPrize] = useState("");
  const [hProvider, setHProvider] = useState<"openai" | "anthropic" | "openrouter">("openai");
  const [hApiKey, setHApiKey] = useState("");
  const [hPrompt, setHPrompt] = useState("");

  // Developer: submit
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");

  // Judging
  const [judging, setJudging] = useState(false);
  const [judgeError, setJudgeError] = useState("");

  const reload = async () => {
    const data = await platformApi.listHackathons();
    setHackathons(data.items);
  };

  useEffect(() => {
    reload().catch(() => {
      // backend may be offline
    });
  }, []);

  const handleCreateHackathon = async () => {
    if (!address || !hName || !hPrize || !hApiKey || !hPrompt) return;
    setJudging(true);
    setJudgeError("");
    try {
      await platformApi.createHackathon({
        foundationAddress: address,
        foundationName: foundationName || "Foundation",
        name: hName,
        description: hDesc,
        prizeAmount: parseFloat(hPrize),
        apiProvider: hProvider,
        apiKey: hApiKey,
        judgePrompt: hPrompt,
      });
      await reload();
      setShowCreateForm(false);
      setHName("");
      setHDesc("");
      setHPrize("");
      setHApiKey("");
      setHPrompt("");
    } catch (err) {
      setJudgeError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setJudging(false);
    }
  };

  const handleSubmit = async (hackathonId: string) => {
    if (!address || !projectName || !repoUrl) return;
    setJudging(true);
    setJudgeError("");
    try {
      await platformApi.submitHackathon(hackathonId, {
        developerAddress: address,
        githubUsername: projectName.split("/")[0] || address.slice(0, 8),
        projectName,
        projectDescription: projectDesc,
        repoUrl,
        demoUrl,
      });
      await reload();
      setProjectName("");
      setProjectDesc("");
      setRepoUrl("");
      setDemoUrl("");
    } catch (err) {
      setJudgeError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setJudging(false);
    }
  };

  const handleJudge = async (hackathonId: string) => {
    if (!address) return;

    setJudging(true);
    setJudgeError("");
    try {
      await platformApi.judgeHackathon(hackathonId, address);
      await reload();
    } catch (err) {
      setJudgeError(err instanceof Error ? err.message : "Judge failed");
    } finally {
      setJudging(false);
    }
  };

  const selected = selectedHackathon ? hackathons.find((h) => h.id === selectedHackathon) : null;

  if (!address) {
    return (
      <div className="card fade-in" style={{ padding: "48px", textAlign: "center" }}>
        <Wallet size={48} style={{ margin: "0 auto 16px", color: "var(--text-muted)", opacity: 0.5 }} />
        <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-secondary)" }}>Connect your wallet to get started</p>
      </div>
    );
  }

  // ─── Detail View ────────────────────────────────────────────────────────
  if (selected) {
    const isOwner = address.toLowerCase() === selected.foundationAddress.toLowerCase();
    const mySubmission = selected.submissions.find(
      (s) => s.developerAddress.toLowerCase() === address.toLowerCase()
    );

    return (
      <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Back */}
        <button className="btn-secondary" style={{ alignSelf: "flex-start", padding: "6px 14px", fontSize: "13px" }} onClick={() => setSelectedHackathon(null)}>
          ← Back to Hackathons
        </button>

        {/* Hackathon Header */}
        <div className="card" style={{ padding: "24px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{selected.name}</h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: 4 }}>{selected.description}</p>
            </div>
            <div className={`badge ${selected.status === "completed" ? "badge-success" : selected.status === "judging" ? "badge-warning" : "badge-brand"}`}>
              {selected.status === "completed" ? "Completed" : selected.status === "judging" ? "Judging..." : "Open"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: "13px", color: "var(--text-muted)" }}>
            <span><Coins size={14} style={{ display: "inline", verticalAlign: "middle" }} /> Prize: <strong style={{ color: "var(--text-primary)" }}>{selected.prizeAmount} MON</strong></span>
            <span><Users size={14} style={{ display: "inline", verticalAlign: "middle" }} /> Submissions: <strong style={{ color: "var(--text-primary)" }}>{selected.submissions.length}</strong></span>
            <span><Bot size={14} style={{ display: "inline", verticalAlign: "middle" }} /> Judge: <strong style={{ color: "var(--text-primary)" }}>{selected.apiProvider}</strong></span>
          </div>
        </div>

        {/* Winner */}
        {selected.winner && (
          <div className="card" style={{ padding: "24px", borderLeft: "3px solid #10b981" }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
              <Crown size={20} style={{ color: "#f59e0b" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>Winner</h3>
            </div>
            <p className="font-mono" style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: 8 }}>
              {selected.winner}
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {selected.winnerReason}
            </p>
          </div>
        )}

        {/* Developer Submit Form */}
        {userRole === "developer" && selected.status === "open" && !mySubmission && (
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Submit Your Project</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <input className="input-field" placeholder="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              <input className="input-field" placeholder="GitHub Repo URL" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
            </div>
            <input className="input-field" placeholder="Demo URL (optional)" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} style={{ marginBottom: 12 }} />
            <textarea
              className="input-field"
              placeholder="Project Description (what does it do, how did you build it?)"
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              rows={3}
              style={{ marginBottom: 12, resize: "vertical" }}
            />
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleSubmit(selected.id)} disabled={!projectName || !repoUrl}>
              <Send size={16} /> Submit Project
            </button>
          </div>
        )}

        {mySubmission && (
          <div className="card" style={{ padding: "16px", borderLeft: "3px solid var(--brand-primary)" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>Your submission: <strong style={{ color: "var(--text-primary)" }}>{mySubmission.projectName}</strong></p>
          </div>
        )}

        {/* Submissions List */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>All Submissions</h3>
          {selected.submissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "14px", border: "1px dashed var(--border)", borderRadius: 10 }}>
              No submissions yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selected.submissions.map((sub, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: selected.winner === sub.developerAddress ? "#f0fdf4" : "var(--bg-surface-2)", borderRadius: 10, border: `1px solid ${selected.winner === sub.developerAddress ? "#bbf7d0" : "var(--border)"}` }}>
                  {selected.winner === sub.developerAddress && <Trophy size={16} style={{ color: "#f59e0b", flexShrink: 0 }} />}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{sub.projectName}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{sub.githubUsername} · {sub.developerAddress.slice(0, 10)}...</p>
                  </div>
                  {sub.repoUrl && (
                    <a href={sub.repoUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: "4px 10px", fontSize: "12px", textDecoration: "none" }}>
                      Repo ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Foundation: Judge */}
        {isOwner && selected.status === "open" && selected.submissions.length > 0 && (
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Judge Submissions</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: 16 }}>
              Your AI agent ({selected.apiProvider}) will evaluate all {selected.submissions.length} submissions
            </p>

            {judgeError && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: "13px", color: "#991b1b", marginBottom: 16 }}>
                {judgeError}
              </div>
            )}

            <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleJudge(selected.id)} disabled={judging}>
              {judging ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> AI is judging...</>
              ) : (
                <><Sparkles size={16} /> Run AI Judge</>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── List View ──────────────────────────────────────────────────────────
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div className="card" style={{ padding: "24px" }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>AI Hackathons</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: 4 }}>
              {userRole === "foundation"
                ? "Create hackathons and let AI judge the winners"
                : "Join hackathons and submit your projects"}
            </p>
          </div>
          {userRole === "foundation" && (
            <button className="btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus size={16} /> Create Hackathon
            </button>
          )}
        </div>
      </div>

      {/* Create Hackathon Form */}
      {showCreateForm && userRole === "foundation" && (
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>New Hackathon</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>Hackathon Name</label>
              <input className="input-field" placeholder="e.g. Monad DeFi Sprint" value={hName} onChange={(e) => setHName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>Prize (MON)</label>
              <input className="input-field" placeholder="e.g. 1000" type="number" value={hPrize} onChange={(e) => setHPrize(e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>Description</label>
            <input className="input-field" placeholder="What is this hackathon about?" value={hDesc} onChange={(e) => setHDesc(e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>AI Provider</label>
              <select className="input-field" value={hProvider} onChange={(e) => setHProvider(e.target.value as "openai" | "anthropic" | "openrouter")}>
                <option value="openai">OpenAI (GPT-4o-mini)</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="openrouter">OpenRouter</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "block" }}>
                <Key size={12} style={{ display: "inline", verticalAlign: "middle" }} /> API Key
              </label>
              <input className="input-field" type="password" placeholder="sk-..." value={hApiKey} onChange={(e) => setHApiKey(e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span><FileText size={12} style={{ display: "inline", verticalAlign: "middle" }} /> Judge System Prompt</span>
              <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>{hPrompt.length}/1000</span>
            </label>
            <textarea
              className="input-field"
              placeholder="You are a hackathon judge. Evaluate projects based on innovation, code quality, and real-world impact..."
              value={hPrompt}
              onChange={(e) => setHPrompt(e.target.value.slice(0, 1000))}
              rows={4}
              style={{ resize: "vertical" }}
            />
          </div>

          <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleCreateHackathon} disabled={!hName || !hPrize || !hApiKey || !hPrompt}>
            <Bot size={16} /> Launch Hackathon
          </button>
        </div>
      )}

      {/* Hackathon List */}
      {hackathons.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <Bot size={48} style={{ margin: "0 auto 16px", color: "var(--text-muted)", opacity: 0.5 }} />
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>No hackathons yet</p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {userRole === "foundation" ? "Create the first AI-judged hackathon!" : "Check back soon for new hackathons."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {hackathons.map((hack) => (
            <div key={hack.id} className="card" style={{ padding: "20px", cursor: "pointer", transition: "border-color 0.2s" }} onClick={() => setSelectedHackathon(hack.id)}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{hack.name}</h3>
                    <div className={`badge ${hack.status === "completed" ? "badge-success" : "badge-brand"}`} style={{ fontSize: "10px" }}>
                      {hack.status === "completed" ? "Completed" : "Open"}
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {hack.submissions.length} submissions · {hack.prizeAmount} MON prize · {hack.apiProvider}
                  </p>
                </div>
                {hack.winner && <Trophy size={20} style={{ color: "#f59e0b" }} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
