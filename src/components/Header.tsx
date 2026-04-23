"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export type TabId = "dashboard" | "developer" | "community" | "foundation" | "hackathon";

export function Header({
  isConnected,
  isWrongNetwork,
  onRegister,
  userContext,
  activeTab,
  onTabChange,
}: {
  isConnected: boolean;
  isWrongNetwork: boolean;
  onRegister: () => void;
  userContext?: { role: string; name?: string; image?: string } | null;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  const tabs: { id: TabId; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "developer", label: "Developers" },
    { id: "community", label: "Community" },
    { id: "foundation", label: "Foundations" },
    { id: "hackathon", label: "AI Hackathon" },
  ];

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        marginBottom: "24px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <img
          src="/logo.png"
          alt="Collab.os"
          style={{ height: 36, objectFit: "contain" }}
        />
      </div>

      {/* Navigation */}
      <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
              background: activeTab === tab.id ? "var(--bg-surface-2)" : "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "var(--bg-surface-2)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {isConnected && !isWrongNetwork && userContext && (
          <>
            {userContext.role === "foundation" && userContext.image && (
              <img
                src={userContext.image}
                alt={userContext.name || "Foundation"}
                style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }}
              />
            )}
            <button className="btn-secondary" onClick={onRegister} id="register-squad-btn" style={{ padding: "6px 14px", fontSize: "13px" }}>
              {userContext.role === "foundation" ? "Create Stream" : "Register Squad"}
            </button>
          </>
        )}
        <ConnectButton
          chainStatus="icon"
          showBalance={false}
          accountStatus="address"
          label="Sign in"
        />
      </div>
    </header>
  );
}
