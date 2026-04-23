"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Users, Plus, Calendar, Trash2, Globe, AtSign, Wallet } from "lucide-react";
import { platformApi, type CommunityProfile, type ScoreOverview } from "@/lib/platformApi";

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

export function CommunityTab() {
  const { address } = useAccount();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [overview, setOverview] = useState<ScoreOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Event form
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventAttendees, setEventAttendees] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [showEventForm, setShowEventForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!address) return;
      try {
        const existing = await platformApi.getCommunity(address);
        setProfile(existing);
        setName(existing.name);
        setDescription(existing.description);
        setWebsite(existing.website);
        setTwitter(existing.twitter);
      } catch {
        // first registration
      }
      try {
        setOverview(await platformApi.getScoreOverview());
      } catch {
        // backend unavailable
      }
    };
    load();
  }, [address]);

  const handleSaveCommunity = async () => {
    if (!address || !name) return;
    setLoading(true);
    setError("");
    try {
      const newProfile = await platformApi.upsertCommunity({
        address,
        name,
        description,
        website,
        twitter,
      });
      setProfile(newProfile);
      setOverview(await platformApi.getScoreOverview());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Community save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!profile || !eventName || !eventDate) return;
    setLoading(true);
    setError("");
    try {
      const updated = await platformApi.addCommunityEvent(profile.address, {
        name: eventName,
        date: eventDate,
        attendees: parseInt(eventAttendees) || 0,
        description: eventDesc,
      });
      setProfile(updated);
      setOverview(await platformApi.getScoreOverview());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Event save failed");
    } finally {
      setLoading(false);
    }
    setEventName("");
    setEventDate("");
    setEventAttendees("");
    setEventDesc("");
    setShowEventForm(false);
  };

  const handleRemoveEvent = async (id: string) => {
    if (!profile) return;
    setLoading(true);
    setError("");
    try {
      const updated = await platformApi.removeCommunityEvent(profile.address, id);
      setProfile(updated);
      setOverview(await platformApi.getScoreOverview());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Event delete failed");
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

      {/* Community Info */}
      <div className="card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4, letterSpacing: "-0.03em" }}>
          Community Profile
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: 24 }}>
          Register your community and track events to build your score
        </p>

        {error && (
          <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: "13px", color: "#991b1b", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <Users size={12} /> Community Name
            </label>
            <input className="input-field" placeholder="e.g. ArfDAO" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <Globe size={12} /> Website
            </label>
            <input className="input-field" placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <AtSign size={12} /> Twitter Handle
            </label>
            <input className="input-field" placeholder="@community" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
              Description
            </label>
            <input className="input-field" placeholder="What does your community do?" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleSaveCommunity} disabled={!name || loading}>
          {profile ? "Update Community" : "Register Community"}
        </button>
      </div>

      {/* Score + Events */}
      {profile && (
        <>
          {/* Score */}
          <div className="card" style={{ padding: "24px" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Community Score
              </p>
              <div className="badge badge-brand">{profile.events.length} events</div>
            </div>
            <MiniGauge score={profile.score} />
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 8 }}>
              Total attendees: <strong>{profile.events.reduce((a, e) => a + e.attendees, 0)}</strong>
            </p>
          </div>

          {/* Events List */}
          <div className="card" style={{ padding: "24px" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Events</h3>
              <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: "13px" }} onClick={() => setShowEventForm(!showEventForm)}>
                <Plus size={14} /> Add Event
              </button>
            </div>

            {/* Add Event Form */}
            {showEventForm && (
              <div style={{ padding: "16px", background: "var(--bg-surface-2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <input className="input-field" placeholder="Event name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
                  <input className="input-field" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <input className="input-field" placeholder="Attendees count" type="number" value={eventAttendees} onChange={(e) => setEventAttendees(e.target.value)} />
                  <input className="input-field" placeholder="Description" value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} />
                </div>
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px" }} onClick={handleAddEvent} disabled={!eventName || !eventDate || loading}>
                  Save Event
                </button>
              </div>
            )}

            {/* Events */}
            {profile.events.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "14px", border: "1px dashed var(--border)", borderRadius: 10 }}>
                No events yet. Add your first community event.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {profile.events.map((event) => (
                  <div key={event.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--bg-surface-2)", borderRadius: 10, border: "1px solid var(--border)" }}>
                    <Calendar size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{event.name}</p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{event.date} · {event.attendees} attendees</p>
                    </div>
                    <button onClick={() => handleRemoveEvent(event.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
