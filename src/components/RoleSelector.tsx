"use client";

import { useState } from "react";

import { Code2, Users, Landmark } from "lucide-react";

export type UserRole = "developer" | "community" | "foundation";
export type UserContextData = { role: UserRole; name?: string; image?: string };

export function RoleSelector({ onSelect }: { onSelect: (data: UserContextData) => void }) {
  const [step, setStep] = useState(1);
  const [foundationName, setFoundationName] = useState("");
  const [foundationImage, setFoundationImage] = useState("");

  if (step === 2) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          padding: "24px",
        }}
      >
        <div
          className="card slide-in"
          style={{
            width: "100%",
            maxWidth: 500,
            padding: "32px",
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "#f3e8ff",
                color: "#7c3aed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Landmark size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                Foundation Profile
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
                Set up your public identity
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Foundation Name
              </label>
              <input
                className="input-field"
                placeholder="e.g. Monad Foundation"
                value={foundationName}
                onChange={(e) => setFoundationName(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Logo URL (Image)
              </label>
              <input
                className="input-field"
                placeholder="https://example.com/logo.png"
                value={foundationImage}
                onChange={(e) => setFoundationImage(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8">
            <button className="btn-secondary" onClick={() => setStep(1)} style={{ padding: "12px 20px", fontSize: "14px" }}>
              Back
            </button>
            <button
              className="btn-primary"
              style={{ flex: 1, justifyContent: "center", padding: "12px 20px", fontSize: "14px" }}
              disabled={!foundationName}
              onClick={() => onSelect({ role: "foundation", name: foundationName, image: foundationImage })}
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(8px)",
        padding: "24px",
      }}
    >
      <div
        className="card slide-in"
        style={{
          width: "100%",
          maxWidth: 700,
          padding: "48px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: 12,
            letterSpacing: "-0.03em",
          }}
        >
          Welcome to CollabOS
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginBottom: 40, fontWeight: 500 }}>
          To personalize your experience, please tell us how you plan to use the platform.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
          }}
        >
          {/* Developer */}
          <RoleCard
            id="role-dev-btn"
            title="Developer"
            description="I want to contribute to squads and earn MON streams based on my GitHub activity."
            icon={<Code2 size={32} />}
            color="#2563eb"
            bgColor="#eff6ff"
            onClick={() => onSelect({ role: "developer" })}
          />

          {/* Community Owner */}
          <RoleCard
            id="role-community-btn"
            title="Community Owner"
            description="I want to register a squad, set up multisig wallets, and receive Foundation grants."
            icon={<Users size={32} />}
            color="#00c49a"
            bgColor="#e6fcf8"
            onClick={() => onSelect({ role: "community" })}
          />

          {/* Foundation */}
          <RoleCard
            id="role-foundation-btn"
            title="Foundation"
            description="I want to distribute MON bounties to active squads and track builder reputation."
            icon={<Landmark size={32} />}
            color="#7c3aed"
            bgColor="#f3e8ff"
            onClick={() => setStep(2)}
          />
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  id,
  title,
  description,
  icon,
  color,
  bgColor,
  onClick,
}: {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "32px 24px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--text-primary)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "20px",
          background: bgColor,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
        {title}
      </h3>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, fontWeight: 500 }}>
        {description}
      </p>
    </button>
  );
}
