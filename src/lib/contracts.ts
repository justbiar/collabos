/**
 * Contract ABIs and addresses for CollabOS.
 * Addresses are set via env vars (populated after deployment).
 * 
 * These are the minimal ABIs needed by the frontend — only functions we call.
 */

// ─── Addresses ────────────────────────────────────────────────────────────────
export const SQUADHUB_ADDRESS = (
  process.env.NEXT_PUBLIC_SQUADHUB_ADDRESS || ""
) as `0x${string}`;

export const STREAMGRANT_ADDRESS = (
  process.env.NEXT_PUBLIC_STREAMGRANT_ADDRESS || ""
) as `0x${string}`;

// ─── SquadHub ABI (minimal) ───────────────────────────────────────────────────
export const SQUADHUB_ABI = [
  {
    name: "registerSquad",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name",          type: "string"  },
      { name: "multisigWallet",type: "address" },
      { name: "githubRepo",    type: "string"  },
      { name: "farcasterFID",  type: "string"  },
    ],
    outputs: [{ name: "squadId", type: "uint256" }],
  },
  {
    name: "depositBounty",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "squadId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getSquad",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "squadId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id",            type: "uint256" },
          { name: "name",          type: "string"  },
          { name: "multisigWallet",type: "address" },
          { name: "githubRepo",    type: "string"  },
          { name: "farcasterFID",  type: "string"  },
          { name: "registrant",    type: "address" },
          { name: "bountyBalance", type: "uint256" },
          { name: "registeredAt",  type: "uint256" },
          { name: "active",        type: "bool"    },
        ],
      },
    ],
  },
  {
    name: "totalSquads",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "registrantToSquadId",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "SquadRegistered",
    type: "event",
    inputs: [
      { name: "squadId",       type: "uint256", indexed: true  },
      { name: "name",          type: "string",  indexed: false },
      { name: "multisigWallet",type: "address", indexed: true  },
      { name: "githubRepo",    type: "string",  indexed: false },
      { name: "farcasterFID",  type: "string",  indexed: false },
      { name: "registrant",    type: "address", indexed: true  },
      { name: "timestamp",     type: "uint256", indexed: false },
    ],
  },
] as const;

// ─── StreamGrant ABI (minimal) ────────────────────────────────────────────────
export const STREAMGRANT_ABI = [
  {
    name: "getStream",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "squadId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "squadId",             type: "uint256" },
          { name: "recipient",           type: "address" },
          { name: "baseFlowRate",        type: "uint256" },
          { name: "allocationBps",       type: "uint256" },
          { name: "reputationScore",     type: "uint256" },
          { name: "effectiveFlowRate",   type: "uint256" },
          { name: "lastUpdateTimestamp", type: "uint256" },
          { name: "storedAccrued",       type: "uint256" },
          { name: "totalClaimed",        type: "uint256" },
          { name: "active",              type: "bool"    },
        ],
      },
    ],
  },
  {
    name: "getAccrued",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "squadId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getScoreLog",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "offset", type: "uint256" },
      { name: "limit",  type: "uint256" },
    ],
    outputs: [
      {
        name: "results",
        type: "tuple[]",
        components: [
          { name: "squadId",          type: "uint256" },
          { name: "oldScore",         type: "uint256" },
          { name: "newScore",         type: "uint256" },
          { name: "newEffectiveRate", type: "uint256" },
          { name: "oracle",           type: "address" },
          { name: "timestamp",        type: "uint256" },
          { name: "txHash",           type: "bytes32" },
        ],
      },
    ],
  },
  {
    name: "scoreLogLength",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "poolBalance",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    name: "claim",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "squadId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "ScoreUpdated",
    type: "event",
    inputs: [
      { name: "squadId",       type: "uint256", indexed: true  },
      { name: "oldScore",      type: "uint256", indexed: false },
      { name: "newScore",      type: "uint256", indexed: false },
      { name: "newEffectiveRate", type: "uint256", indexed: false },
      { name: "oracleAddress", type: "address", indexed: true  },
      { name: "timestamp",     type: "uint256", indexed: false },
    ],
  },
] as const;
