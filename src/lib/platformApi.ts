const ORACLE_API = process.env.NEXT_PUBLIC_ORACLE_API_URL || "http://localhost:8000";
const FORCE_MOCK = process.env.NEXT_PUBLIC_FORCE_PLATFORM_MOCK === "1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (FORCE_MOCK) {
    throw new Error("FORCE_MOCK");
  }

  const res = await fetch(`${ORACLE_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    let detail = `${res.status}`;
    try {
      const data = await res.json();
      detail = data.detail || JSON.stringify(data);
    } catch {
      detail = await res.text();
    }
    throw new Error(detail || "Request failed");
  }

  return (await res.json()) as T;
}

const MOCK_KEYS = {
  developers: "collabos_platform_mock_developers",
  communities: "collabos_platform_mock_communities",
  foundations: "collabos_platform_mock_foundations",
  hackathons: "collabos_platform_mock_hackathons",
};

function readMock<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function writeMock<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function lower(value: string): string {
  return value.toLowerCase();
}

function nowMs(): number {
  return Date.now();
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function hashFromText(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return hash;
}

function calcDeveloperScore(profile: DeveloperProfile): number {
  const g = profile.githubData;
  const f = profile.farcasterData;
  const githubScore = g
    ? g.commits * 1.5 + g.mergedPrs * 3 + g.closedIssues * 2 + g.stars * 0.5
    : 0;
  const farcasterScore = f
    ? f.casts * 0.5 + f.reactions * 0.3 + f.followers * 0.1
    : 0;
  return Math.min(100, Math.round(githubScore + farcasterScore));
}

function calcCommunityScore(profile: CommunityProfile): number {
  const eventScore = profile.events.length * 10;
  const attendeeScore = profile.events.reduce((acc, e) => acc + e.attendees, 0) * 0.5;
  const investmentBonus = profile.receivedInvestmentMon * 0.2;
  return Math.min(100, Math.round(eventScore + attendeeScore + investmentBonus));
}

function calcFoundationScore(profile: FoundationProfile): number {
  const grantScore = profile.grants.length * 15;
  const monScore = profile.grants.reduce((acc, g) => acc + g.amount, 0) * 0.01;
  const investScore = profile.investments.length * 10;
  return Math.min(100, Math.round(grantScore + monScore + investScore));
}

async function withFallback<T>(backendCall: () => Promise<T>, mockCall: () => T): Promise<T> {
  try {
    return await backendCall();
  } catch {
    return mockCall();
  }
}

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
  } | null;
  githubMeta?: {
    avatarUrl: string;
    bio: string;
    name: string;
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
  receivedInvestmentMon: number;
  score: number;
  registeredAt: number;
}

export interface Grant {
  id: string;
  recipientAddress: string;
  recipientName: string;
  amount: number;
  description: string;
  date: string;
}

export interface Investment {
  id: string;
  investorName: string;
  amount: number;
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
  prizeAmount: number;
  apiProvider: "openai" | "anthropic" | "openrouter";
  judgePrompt: string;
  submissions: HackathonSubmission[];
  winner?: string;
  winnerReason?: string;
  createdAt: number;
  status: "open" | "judging" | "completed";
}

export interface ScoreOverview {
  developerAverage: number;
  communityAverage: number;
  foundationAverage: number;
  ecosystemScore: number;
  totals: {
    developers: number;
    communities: number;
    foundations: number;
    hackathons: number;
  };
}

export const platformApi = {
  // Developer
  registerDeveloper: (payload: {
    address: string;
    githubUsername: string;
    farcasterFid: string;
  }) =>
    withFallback(
      () => request<DeveloperProfile>("/platform/developers/register", { method: "POST", body: JSON.stringify(payload) }),
      () => {
        const all = readMock<DeveloperProfile>(MOCK_KEYS.developers);
        const seed = hashFromText(payload.githubUsername + payload.farcasterFid + payload.address);
        const profile: DeveloperProfile = {
          address: payload.address,
          githubUsername: payload.githubUsername,
          farcasterFid: payload.farcasterFid,
          githubData: {
            repos: 3 + (seed % 20),
            commits: 10 + (seed % 50),
            mergedPrs: 2 + (seed % 12),
            closedIssues: 1 + (seed % 10),
            stars: 20 + (seed % 300),
          },
          farcasterData: payload.farcasterFid
            ? {
                casts: 5 + (seed % 30),
                reactions: 10 + (seed % 120),
                followers: seed % 500,
              }
            : null,
          githubMeta: {
            avatarUrl: `https://github.com/${payload.githubUsername}.png`,
            bio: "Mock profile for local demo",
            name: payload.githubUsername,
          },
          score: 0,
          registeredAt: nowMs(),
        };
        profile.score = calcDeveloperScore(profile);
        const idx = all.findIndex((d) => lower(d.address) === lower(payload.address));
        if (idx >= 0) all[idx] = profile;
        else all.push(profile);
        writeMock(MOCK_KEYS.developers, all);
        return profile;
      }
    ),

  getDeveloper: (address: string) =>
    withFallback(
      () => request<DeveloperProfile>(`/platform/developers/${address}`),
      () => {
        const item = readMock<DeveloperProfile>(MOCK_KEYS.developers).find((d) => lower(d.address) === lower(address));
        if (!item) throw new Error("Developer not found");
        return item;
      }
    ),

  // Community
  upsertCommunity: (payload: {
    address: string;
    name: string;
    description: string;
    website: string;
    twitter: string;
  }) =>
    withFallback(
      () => request<CommunityProfile>("/platform/communities/upsert", { method: "POST", body: JSON.stringify(payload) }),
      () => {
        const all = readMock<CommunityProfile>(MOCK_KEYS.communities);
        const existing = all.find((c) => lower(c.address) === lower(payload.address));
        const profile: CommunityProfile = {
          address: payload.address,
          name: payload.name,
          description: payload.description,
          website: payload.website,
          twitter: payload.twitter,
          events: existing?.events || [],
          receivedInvestmentMon: existing?.receivedInvestmentMon || 0,
          score: 0,
          registeredAt: existing?.registeredAt || nowMs(),
        };
        profile.score = calcCommunityScore(profile);
        const idx = all.findIndex((c) => lower(c.address) === lower(payload.address));
        if (idx >= 0) all[idx] = profile;
        else all.push(profile);
        writeMock(MOCK_KEYS.communities, all);
        return profile;
      }
    ),

  getCommunity: (address: string) =>
    withFallback(
      () => request<CommunityProfile>(`/platform/communities/${address}`),
      () => {
        const item = readMock<CommunityProfile>(MOCK_KEYS.communities).find((c) => lower(c.address) === lower(address));
        if (!item) throw new Error("Community not found");
        return item;
      }
    ),

  addCommunityEvent: (address: string, payload: {
    name: string;
    date: string;
    attendees: number;
    description: string;
  }) =>
    withFallback(
      () => request<CommunityProfile>(`/platform/communities/${address}/events`, { method: "POST", body: JSON.stringify(payload) }),
      () => {
        const all = readMock<CommunityProfile>(MOCK_KEYS.communities);
        const idx = all.findIndex((c) => lower(c.address) === lower(address));
        if (idx < 0) throw new Error("Community not found");
        all[idx].events.push({ id: makeId(), ...payload });
        all[idx].score = calcCommunityScore(all[idx]);
        writeMock(MOCK_KEYS.communities, all);
        return all[idx];
      }
    ),

  removeCommunityEvent: (address: string, eventId: string) =>
    withFallback(
      () => request<CommunityProfile>(`/platform/communities/${address}/events/${eventId}`, { method: "DELETE" }),
      () => {
        const all = readMock<CommunityProfile>(MOCK_KEYS.communities);
        const idx = all.findIndex((c) => lower(c.address) === lower(address));
        if (idx < 0) throw new Error("Community not found");
        all[idx].events = all[idx].events.filter((e) => e.id !== eventId);
        all[idx].score = calcCommunityScore(all[idx]);
        writeMock(MOCK_KEYS.communities, all);
        return all[idx];
      }
    ),

  // Foundation
  upsertFoundation: (payload: { address: string; name: string; image?: string }) =>
    withFallback(
      () => request<FoundationProfile>("/platform/foundations/upsert", { method: "POST", body: JSON.stringify(payload) }),
      () => {
        const all = readMock<FoundationProfile>(MOCK_KEYS.foundations);
        const existing = all.find((f) => lower(f.address) === lower(payload.address));
        const profile: FoundationProfile = {
          address: payload.address,
          name: payload.name,
          image: payload.image,
          grants: existing?.grants || [],
          investments: existing?.investments || [],
          score: 0,
          registeredAt: existing?.registeredAt || nowMs(),
        };
        profile.score = calcFoundationScore(profile);
        const idx = all.findIndex((f) => lower(f.address) === lower(payload.address));
        if (idx >= 0) all[idx] = profile;
        else all.push(profile);
        writeMock(MOCK_KEYS.foundations, all);
        return profile;
      }
    ),

  getFoundation: (address: string) =>
    withFallback(
      () => request<FoundationProfile>(`/platform/foundations/${address}`),
      () => {
        const item = readMock<FoundationProfile>(MOCK_KEYS.foundations).find((f) => lower(f.address) === lower(address));
        if (!item) throw new Error("Foundation not found");
        return item;
      }
    ),

  addGrant: (address: string, payload: {
    recipientAddress: string;
    recipientName: string;
    amount: number;
    description: string;
  }) =>
    withFallback(
      () => request<FoundationProfile>(`/platform/foundations/${address}/grants`, { method: "POST", body: JSON.stringify(payload) }),
      () => {
        const foundations = readMock<FoundationProfile>(MOCK_KEYS.foundations);
        const idx = foundations.findIndex((f) => lower(f.address) === lower(address));
        if (idx < 0) throw new Error("Foundation not found");
        foundations[idx].grants.push({
          id: makeId(),
          recipientAddress: payload.recipientAddress,
          recipientName: payload.recipientName,
          amount: payload.amount,
          description: payload.description,
          date: new Date().toISOString().split("T")[0],
        });
        foundations[idx].score = calcFoundationScore(foundations[idx]);
        writeMock(MOCK_KEYS.foundations, foundations);

        const communities = readMock<CommunityProfile>(MOCK_KEYS.communities);
        const cidx = communities.findIndex((c) => lower(c.address) === lower(payload.recipientAddress));
        if (cidx >= 0) {
          communities[cidx].receivedInvestmentMon += payload.amount;
          communities[cidx].score = calcCommunityScore(communities[cidx]);
          writeMock(MOCK_KEYS.communities, communities);
        }
        return foundations[idx];
      }
    ),

  removeGrant: (address: string, grantId: string) =>
    withFallback(
      () => request<FoundationProfile>(`/platform/foundations/${address}/grants/${grantId}`, { method: "DELETE" }),
      () => {
        const all = readMock<FoundationProfile>(MOCK_KEYS.foundations);
        const idx = all.findIndex((f) => lower(f.address) === lower(address));
        if (idx < 0) throw new Error("Foundation not found");
        all[idx].grants = all[idx].grants.filter((g) => g.id !== grantId);
        all[idx].score = calcFoundationScore(all[idx]);
        writeMock(MOCK_KEYS.foundations, all);
        return all[idx];
      }
    ),

  addInvestment: (address: string, payload: { investorName: string; amount: number }) =>
    withFallback(
      () => request<FoundationProfile>(`/platform/foundations/${address}/investments`, { method: "POST", body: JSON.stringify(payload) }),
      () => {
        const all = readMock<FoundationProfile>(MOCK_KEYS.foundations);
        const idx = all.findIndex((f) => lower(f.address) === lower(address));
        if (idx < 0) throw new Error("Foundation not found");
        all[idx].investments.push({
          id: makeId(),
          investorName: payload.investorName,
          amount: payload.amount,
          date: new Date().toISOString().split("T")[0],
        });
        all[idx].score = calcFoundationScore(all[idx]);
        writeMock(MOCK_KEYS.foundations, all);
        return all[idx];
      }
    ),

  removeInvestment: (address: string, investmentId: string) =>
    withFallback(
      () => request<FoundationProfile>(`/platform/foundations/${address}/investments/${investmentId}`, { method: "DELETE" }),
      () => {
        const all = readMock<FoundationProfile>(MOCK_KEYS.foundations);
        const idx = all.findIndex((f) => lower(f.address) === lower(address));
        if (idx < 0) throw new Error("Foundation not found");
        all[idx].investments = all[idx].investments.filter((i) => i.id !== investmentId);
        all[idx].score = calcFoundationScore(all[idx]);
        writeMock(MOCK_KEYS.foundations, all);
        return all[idx];
      }
    ),

  // Hackathon
  listHackathons: () =>
    withFallback(
      () => request<{ items: Hackathon[] }>("/platform/hackathons"),
      () => ({ items: readMock<Hackathon>(MOCK_KEYS.hackathons) })
    ),

  createHackathon: (payload: {
    foundationAddress: string;
    foundationName: string;
    name: string;
    description: string;
    prizeAmount: number;
    apiProvider: "openai" | "anthropic" | "openrouter";
    apiKey: string;
    judgePrompt: string;
  }) =>
    withFallback(
      () => request<Hackathon>("/platform/hackathons", { method: "POST", body: JSON.stringify(payload) }),
      () => {
        const all = readMock<Hackathon>(MOCK_KEYS.hackathons);
        const item: Hackathon = {
          id: makeId(),
          foundationAddress: payload.foundationAddress,
          foundationName: payload.foundationName,
          name: payload.name,
          description: payload.description,
          prizeAmount: payload.prizeAmount,
          apiProvider: payload.apiProvider,
          judgePrompt: payload.judgePrompt,
          submissions: [],
          createdAt: nowMs(),
          status: "open",
        };
        all.unshift(item);
        writeMock(MOCK_KEYS.hackathons, all);
        return item;
      }
    ),

  submitHackathon: (hackathonId: string, payload: {
    developerAddress: string;
    githubUsername: string;
    projectName: string;
    projectDescription: string;
    repoUrl: string;
    demoUrl: string;
  }) =>
    withFallback(
      () => request<Hackathon>(`/platform/hackathons/${hackathonId}/submissions`, { method: "POST", body: JSON.stringify(payload) }),
      () => {
        const all = readMock<Hackathon>(MOCK_KEYS.hackathons);
        const idx = all.findIndex((h) => h.id === hackathonId);
        if (idx < 0) throw new Error("Hackathon not found");
        const submission: HackathonSubmission = {
          ...payload,
          submittedAt: nowMs(),
        };
        const existingIdx = all[idx].submissions.findIndex(
          (s) => lower(s.developerAddress) === lower(payload.developerAddress)
        );
        if (existingIdx >= 0) all[idx].submissions[existingIdx] = submission;
        else all[idx].submissions.push(submission);
        writeMock(MOCK_KEYS.hackathons, all);
        return all[idx];
      }
    ),

  judgeHackathon: (hackathonId: string, foundationAddress: string) =>
    withFallback(
      () => request<Hackathon>(`/platform/hackathons/${hackathonId}/judge`, { method: "POST", body: JSON.stringify({ foundationAddress }) }),
      () => {
        const all = readMock<Hackathon>(MOCK_KEYS.hackathons);
        const idx = all.findIndex((h) => h.id === hackathonId);
        if (idx < 0) throw new Error("Hackathon not found");
        if (lower(all[idx].foundationAddress) !== lower(foundationAddress)) {
          throw new Error("Only foundation owner can judge");
        }
        if (all[idx].submissions.length === 0) throw new Error("No submissions");
        const winner = all[idx].submissions[0];
        all[idx].status = "completed";
        all[idx].winner = winner.developerAddress;
        all[idx].winnerReason = "Mock judge selected first submission for demo.";
        writeMock(MOCK_KEYS.hackathons, all);
        return all[idx];
      }
    ),

  // Scores
  getScoreOverview: () =>
    withFallback(
      () => request<ScoreOverview>("/platform/scores/overview"),
      () => {
        const developers = readMock<DeveloperProfile>(MOCK_KEYS.developers);
        const communities = readMock<CommunityProfile>(MOCK_KEYS.communities);
        const foundations = readMock<FoundationProfile>(MOCK_KEYS.foundations);
        const hackathons = readMock<Hackathon>(MOCK_KEYS.hackathons);

        const developerAverage = developers.length
          ? Number((developers.reduce((acc, d) => acc + d.score, 0) / developers.length).toFixed(2))
          : 0;
        const communityAverage = communities.length
          ? Number((communities.reduce((acc, c) => acc + c.score, 0) / communities.length).toFixed(2))
          : 0;
        const foundationAverage = foundations.length
          ? Number((foundations.reduce((acc, f) => acc + f.score, 0) / foundations.length).toFixed(2))
          : 0;

        return {
          developerAverage,
          communityAverage,
          foundationAverage,
          ecosystemScore: Number((developerAverage * 0.5 + communityAverage * 0.25 + foundationAverage * 0.25).toFixed(2)),
          totals: {
            developers: developers.length,
            communities: communities.length,
            foundations: foundations.length,
            hackathons: hackathons.length,
          },
        };
      }
    ),
};
