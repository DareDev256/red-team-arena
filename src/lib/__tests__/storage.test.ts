import { describe, it, expect, beforeEach } from "vitest";

// ─── localStorage + window mock ───
// storage.ts guards every function with `typeof window === "undefined"`.
// In Node.js, window doesn't exist, so we must define both window AND
// localStorage on globalThis BEFORE importing storage.

const store: Record<string, string> = {};
const mockStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  get length() { return Object.keys(store).length; },
  key: (i: number) => Object.keys(store)[i] ?? null,
};

// Define window so `typeof window !== "undefined"` passes
if (typeof globalThis.window === "undefined") {
  (globalThis as Record<string, unknown>).window = globalThis;
}
Object.defineProperty(globalThis, "localStorage", { value: mockStorage, writable: true, configurable: true });

// Import AFTER mocks are in place
const {
  getProgress, saveProgress, addXP, completeLevel,
  updateItemScore, getRecallMultiplier,
  saveFSRSCard, getDueItems,
  checkMastery, recordMasteryAttempt, resetProgress,
} = await import("../storage");

beforeEach(() => { mockStorage.clear(); });

describe("storage — progress CRUD", () => {
  it("returns defaults when nothing stored", () => {
    const p = getProgress();
    expect(p.xp).toBe(0);
    expect(p.level).toBe(1);
    expect(p.completedLevels).toEqual([]);
  });

  it("round-trips progress through save/get", () => {
    saveProgress({ xp: 50, level: 2, currentCategory: "x", completedLevels: ["x-1"], streak: 3, streakFreezes: 1, itemScores: {} });
    expect(getProgress().xp).toBe(50);
    expect(getProgress().completedLevels).toEqual(["x-1"]);
  });

  it("merges with defaults for forward compat", () => {
    store["red_team_arena_progress"] = JSON.stringify({ xp: 10 });
    const p = getProgress();
    expect(p.xp).toBe(10);
    expect(p.streakFreezes).toBe(0);
  });

  it("handles corrupted JSON gracefully", () => {
    store["red_team_arena_progress"] = "{broken";
    expect(getProgress().xp).toBe(0);
  });
});

describe("storage — XP system", () => {
  it("adds XP and auto-calculates level", () => {
    const p = addXP(150);
    expect(p.xp).toBe(150);
    expect(p.level).toBe(2);
  });

  it("applies multiplier", () => {
    expect(addXP(10, 3).xp).toBe(30);
  });

  it("accumulates across calls", () => {
    addXP(40);
    expect(addXP(60).xp).toBe(100);
  });
});

describe("storage — recall multiplier", () => {
  it("returns 1x for unseen items", () => {
    expect(getRecallMultiplier("new")).toBe(1);
  });

  it("returns 2x after 7+ days", () => {
    // Directly set up the state instead of relying on updateItemScore
    saveProgress({
      ...getProgress(),
      itemScores: { "item-7d": { correct: 1, incorrect: 0, lastSeen: Date.now() - 8 * 86400000 } },
    });
    expect(getRecallMultiplier("item-7d")).toBe(2);
  });

  it("returns 3x after 30+ days", () => {
    saveProgress({
      ...getProgress(),
      itemScores: { "item-30d": { correct: 1, incorrect: 0, lastSeen: Date.now() - 31 * 86400000 } },
    });
    expect(getRecallMultiplier("item-30d")).toBe(3);
  });
});

describe("storage — level completion", () => {
  it("adds level to completedLevels", () => {
    expect(completeLevel("basic-injection", 1).completedLevels).toContain("basic-injection-1");
  });

  it("is idempotent", () => {
    completeLevel("a", 1);
    const p = completeLevel("a", 1);
    expect(p.completedLevels.filter((l) => l === "a-1").length).toBe(1);
  });

  it("awards streak freeze every 10 levels", () => {
    for (let i = 1; i <= 10; i++) completeLevel("cat", i);
    expect(getProgress().streakFreezes).toBe(1);
  });
});

describe("storage — mastery gate", () => {
  it("requires 3 attempts", () => {
    recordMasteryAttempt("lv", 95);
    recordMasteryAttempt("lv", 95);
    expect(checkMastery("lv")).toBe(false);
  });

  it("passes at 90%+ on last 3", () => {
    for (let i = 0; i < 3; i++) recordMasteryAttempt("lv2", 91 + i);
    expect(checkMastery("lv2")).toBe(true);
  });

  it("fails if any of last 3 under 90%", () => {
    recordMasteryAttempt("lv3", 95);
    recordMasteryAttempt("lv3", 85);
    recordMasteryAttempt("lv3", 95);
    expect(checkMastery("lv3")).toBe(false);
  });
});

describe("storage — FSRS cards", () => {
  it("filters due vs future items", () => {
    saveFSRSCard({ itemId: "due", due: Date.now() - 1000, stability: 1, difficulty: 0.5, reps: 1, lapses: 0, lastReview: 0 });
    saveFSRSCard({ itemId: "future", due: Date.now() + 99999, stability: 1, difficulty: 0.5, reps: 1, lapses: 0, lastReview: 0 });
    const items = getDueItems();
    expect(items).toContain("due");
    expect(items).not.toContain("future");
  });

  it("updates existing card by itemId", () => {
    saveFSRSCard({ itemId: "c1", due: 100, stability: 1, difficulty: 0.5, reps: 1, lapses: 0, lastReview: 0 });
    saveFSRSCard({ itemId: "c1", due: 200, stability: 2, difficulty: 0.5, reps: 2, lapses: 0, lastReview: 0 });
    expect(getDueItems(100).filter((id) => id === "c1").length).toBe(1);
  });
});

describe("storage — reset", () => {
  it("wipes all game data", () => {
    addXP(100);
    recordMasteryAttempt("lv", 95);
    resetProgress();
    expect(getProgress().xp).toBe(0);
  });
});
