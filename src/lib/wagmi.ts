/**
 * Wagmi v2 + RainbowKit v2 config locked to Monad Testnet.
 * This is the single source of truth for chain + connector config.
 */

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// ─── Monad Testnet Chain Definition ──────────────────────────────────────────
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});

// ─── WalletConnect Project ID ─────────────────────────────────────────────────
export const WC_PROJECT_ID =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID || "5b3b5c7a2d8e1f4a6c9d0e2f3a7b8c9d";

// ─── Wagmi Config via RainbowKit ──────────────────────────────────────────────
export const wagmiConfig = getDefaultConfig({
  appName: "CollabOS — Autonomous Builder Economy",
  projectId: WC_PROJECT_ID,
  chains: [monadTestnet],
  ssr: true,
});
