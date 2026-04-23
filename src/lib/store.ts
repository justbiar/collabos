// lib/store.ts — CollabOS localStorage data store

export interface DeveloperProfile {
  address: string;
  githubUsername: string;
  farcasterFid: string;
  githubData?: {
    repos: number;
    commits: number;
    mergedPrs: number;
    closedIssues: number;
    stars: number;
  };
  farcasterData?: {
    casts: number;
    reactions: number;
    followers: number;
  };
  score: number;
  registeredAt: number;
}

export interface CommunityEvent {
  id: string;
  name: string;
  date: string;
  attendees: number;
  description: string;
}

export interface CommunityProfile {
  address: string;
  name: string;
  description: string;
  website: string;
  twitter: string;
  events: CommunityEvent[];
  score: number;
  registeredAt: number;
}

export interface Grant {
  id: string;
  recipientSquad: string;
  amount: number; // in MON
  description: string;
  date: string;
}

export interface Investment {
  id: string;
  investorName: string;
  amount: number; // in MON
  date: string;
}

export interface FoundationProfile {
  address: string;
  name: string;
  image?: string;
  grants: Grant[];
  investments: Investment[];
  score: number;
  registeredAt: number;
}

export interface HackathonSubmission {
  developerAddress: string;
  githubUsername: string;
  projectName: string;
  projectDescription: string;
  repoUrl: string;
  demoUrl: string;
  submittedAt: number;
}

export interface Hackathon {
  id: string;
  foundationAddress: string;
  foundationName: string;
  name: string;
  description: string;
  prizeAmount: number; // in MON
  apiProvider: "openai" | "anthropic" | "openrouter";
  judgePrompt: string;
  submissions: HackathonSubmission[];
  winner?: string; // developer address
  winnerReason?: string;
  createdAt: number;
  status: "open" | "judging" | "completed";
}

// ─── Store Keys ──────────────────────────────────────────────────────────────
const KEYS = {
  developers: "collabos_developers",
  communities: "collabos_communities",
  foundations: "collabos_foundations",
  hackathons: "collabos_hackathons",
};

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Developer Store ──────────────────────────────────────────────────────────
export const developerStore = {
  getAll: (): DeveloperProfile[] => read<DeveloperProfile>(KEYS.developers),

  getByAddress: (address: string): DeveloperProfile | undefined =>
    read<DeveloperProfile>(KEYS.developers).find(
      (d) => d.address.toLowerCase() === address.toLowerCase()
    ),

  save: (profile: DeveloperProfile): void => {
    const all = read<DeveloperProfile>(KEYS.developers);
    const idx = all.findIndex(
      (d) => d.address.toLowerCase() === profile.address.toLowerCase()
    );
    if (idx >= 0) all[idx] = profile;
    else all.push(profile);
    write(KEYS.developers, all);
  },
};

// ─── Community Store ──────────────────────────────────────────────────────────
export const communityStore = {
  getAll: (): CommunityProfile[] => read<CommunityProfile>(KEYS.communities),

  getByAddress: (address: string): CommunityProfile | undefined =>
    read<CommunityProfile>(KEYS.communities).find(
      (c) => c.address.toLowerCase() === address.toLowerCase()
    ),

  save: (profile: CommunityProfile): void => {
    const all = read<CommunityProfile>(KEYS.communities);
    const idx = all.findIndex(
      (c) => c.address.toLowerCase() === profile.address.toLowerCase()
    );
    if (idx >= 0) all[idx] = profile;
    else all.push(profile);
    write(KEYS.communities, all);
  },
};

// ─── Foundation Store ─────────────────────────────────────────────────────────
export const foundationStore = {
  getAll: (): FoundationProfile[] => read<FoundationProfile>(KEYS.foundations),

  getByAddress: (address: string): FoundationProfile | undefined =>
    read<FoundationProfile>(KEYS.foundations).find(
      (f) => f.address.toLowerCase() === address.toLowerCase()
    ),

  save: (profile: FoundationProfile): void => {
    const all = read<FoundationProfile>(KEYS.foundations);
    const idx = all.findIndex(
      (f) => f.address.toLowerCase() === profile.address.toLowerCase()
    );
    if (idx >= 0) all[idx] = profile;
    else all.push(profile);
    write(KEYS.foundations, all);
  },
};

// ─── Hackathon Store ──────────────────────────────────────────────────────────
export const hackathonStore = {
  getAll: (): Hackathon[] => read<Hackathon>(KEYS.hackathons),

  getById: (id: string): Hackathon | undefined =>
    read<Hackathon>(KEYS.hackathons).find((h) => h.id === id),

  save: (hackathon: Hackathon): void => {
    const all = read<Hackathon>(KEYS.hackathons);
    const idx = all.findIndex((h) => h.id === hackathon.id);
    if (idx >= 0) all[idx] = hackathon;
    else all.push(hackathon);
    write(KEYS.hackathons, all);
  },

  addSubmission: (hackathonId: string, sub: HackathonSubmission): void => {
    const all = read<Hackathon>(KEYS.hackathons);
    const hack = all.find((h) => h.id === hackathonId);
    if (!hack) return;
    const existing = hack.submissions.findIndex(
      (s) => s.developerAddress.toLowerCase() === sub.developerAddress.toLowerCase()
    );
    if (existing >= 0) hack.submissions[existing] = sub;
    else hack.submissions.push(sub);
    write(KEYS.hackathons, all);
  },
};

// ─── Score Calculators ────────────────────────────────────────────────────────
export function calcDeveloperScore(profile: DeveloperProfile): number {
  const g = profile.githubData;
  const f = profile.farcasterData;
  if (!g && !f) return 0;
  const githubScore = g
    ? (g.commits * 1.5) + (g.mergedPrs * 3) + (g.closedIssues * 2) + (g.stars * 0.5)
    : 0;
  const farcasterScore = f
    ? (f.casts * 0.5) + (f.reactions * 0.3) + (f.followers * 0.1)
    : 0;
  return Math.min(100, Math.round(githubScore + farcasterScore));
}

export function calcCommunityScore(profile: CommunityProfile): number {
  const eventScore = profile.events.length * 10;
  const attendeeScore = profile.events.reduce((acc, e) => acc + e.attendees, 0) * 0.5;
  return Math.min(100, Math.round(eventScore + attendeeScore));
}

export function calcFoundationScore(profile: FoundationProfile): number {
  const grantScore = profile.grants.length * 15;
  const monScore = profile.grants.reduce((acc, g) => acc + g.amount, 0) * 0.01;
  const investScore = profile.investments.length * 10;
  return Math.min(100, Math.round(grantScore + monScore + investScore));
}
