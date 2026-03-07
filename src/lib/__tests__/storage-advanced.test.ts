import { describe, it, expect, beforeEach } from "vitest";

// ─── localStorage + window mock (same pattern as storage.test.ts) ───
const store: Record<string, string> = {};
const mockStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  get length() { return Object.keys(store).length; },
  key: (i: number) => Object.keys(store)[i] ?? null,
};

if (typeof globalThis.window === "undefined") {
  (globalThis as Record<string, unknown>).window = globalThis;
}
Object.defineProperty(globalThis, "localStorage", { value: mockStorage, writable: true, configurable: true });

const {
  getProgress, saveProgress, updateItemScore,
  getItemsForReview, updateStreak, saveFSRSCard,
  recordLearningEvent, getLearningAnalytics,
} = await import("../storage");

beforeEach(() => { mockStorage.clear(); });

// ─── updateStreak — Date Logic ───
// This is the most bug-prone function: yesterday/today comparisons,
// freeze consumption, and streak reset all depend on Date math.

describe("updateStreak — date-sensitive streak logic", () => {
  it("increments streak when last played yesterday", () => {
    saveProgress({ ...getProgress(), streak: 5, streakFreezes: 0 });
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    store["red_team_arena_last_played"] = yesterday;

    const result = updateStreak();
    expect(result.streak).toBe(6);
  });

  it("preserves streak (no increment) when already played today", () => {
    saveProgress({ ...getProgress(), streak: 3 });
    const today = new Date().toDateString();
    store["red_team_arena_last_played"] = today;

    const result = updateStreak();
    expect(result.streak).toBe(3);
  });

  it("resets streak to 1 when day missed and no freezes", () => {
    saveProgress({ ...getProgress(), streak: 10, streakFreezes: 0 });
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toDateString();
    store["red_team_arena_last_played"] = twoDaysAgo;

    const result = updateStreak();
    expect(result.streak).toBe(1);
  });

  it("consumes a freeze when day missed, preserving streak", () => {
    saveProgress({ ...getProgress(), streak: 7, streakFreezes: 2 });
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toDateString();
    store["red_team_arena_last_played"] = twoDaysAgo;

    const result = updateStreak();
    expect(result.streak).toBe(7); // preserved, not incremented
    expect(result.streakFreezes).toBe(1); // one consumed
  });

  it("starts streak at 1 on first ever play (no last_played)", () => {
    const result = updateStreak();
    expect(result.streak).toBe(1);
  });

  it("sets last_played to today after update", () => {
    updateStreak();
    const today = new Date().toDateString();
    expect(store["red_team_arena_last_played"]).toBe(today);
  });
});

// ─── updateItemScore ───

describe("updateItemScore — score tracking", () => {
  it("creates new score entry on first interaction", () => {
    const result = updateItemScore("item-new", true);
    expect(result.itemScores["item-new"].correct).toBe(1);
    expect(result.itemScores["item-new"].incorrect).toBe(0);
  });

  it("increments incorrect count on wrong answer", () => {
    updateItemScore("q1", false);
    const result = updateItemScore("q1", false);
    expect(result.itemScores["q1"].incorrect).toBe(2);
    expect(result.itemScores["q1"].correct).toBe(0);
  });

  it("tracks multiple items independently", () => {
    updateItemScore("a", true);
    updateItemScore("b", false);
    const p = getProgress();
    expect(p.itemScores["a"].correct).toBe(1);
    expect(p.itemScores["b"].incorrect).toBe(1);
  });

  it("updates lastSeen timestamp", () => {
    const before = Date.now();
    updateItemScore("timed", true);
    const after = Date.now();
    const seen = getProgress().itemScores["timed"].lastSeen;
    expect(seen).toBeGreaterThanOrEqual(before);
    expect(seen).toBeLessThanOrEqual(after);
  });
});

// ─── getItemsForReview — Fallback Logic ───

describe("getItemsForReview — FSRS with naive fallback", () => {
  it("returns FSRS due items when available", () => {
    saveFSRSCard({ itemId: "fsrs-1", due: Date.now() - 1000, stability: 1, difficulty: 0.5, reps: 1, lapses: 0, lastReview: 0 });
    const items = getItemsForReview();
    expect(items).toContain("fsrs-1");
  });

  it("falls back to naive sorting when no FSRS items due", () => {
    // No FSRS cards, but item scores with more incorrect than correct
    saveProgress({
      ...getProgress(),
      itemScores: {
        "weak-item": { correct: 1, incorrect: 5, lastSeen: Date.now() - 10000 },
        "strong-item": { correct: 10, incorrect: 0, lastSeen: Date.now() },
      },
    });
    const items = getItemsForReview();
    expect(items).toContain("weak-item");
    expect(items).not.toContain("strong-item"); // correct > incorrect
  });

  it("returns empty array when no items need review", () => {
    expect(getItemsForReview()).toEqual([]);
  });

  it("respects limit parameter", () => {
    saveProgress({
      ...getProgress(),
      itemScores: {
        "w1": { correct: 0, incorrect: 3, lastSeen: 100 },
        "w2": { correct: 0, incorrect: 2, lastSeen: 200 },
        "w3": { correct: 0, incorrect: 1, lastSeen: 300 },
      },
    });
    const items = getItemsForReview(2);
    expect(items.length).toBe(2);
  });
});

// ─── Learning Analytics Pipeline ───

describe("recordLearningEvent + getLearningAnalytics", () => {
  it("returns zeroes with no events", () => {
    const a = getLearningAnalytics();
    expect(a.totalItemsSeen).toBe(0);
    expect(a.itemsMastered).toBe(0);
    expect(a.retentionRate7Day).toBe(0);
  });

  it("counts unique items seen", () => {
    recordLearningEvent({ type: "first_correct", itemId: "a", timestamp: 1 });
    recordLearningEvent({ type: "review_correct", itemId: "a", timestamp: 2 });
    recordLearningEvent({ type: "first_correct", itemId: "b", timestamp: 3 });
    expect(getLearningAnalytics().totalItemsSeen).toBe(2);
  });

  it("counts mastered items", () => {
    recordLearningEvent({ type: "concept_mastered", itemId: "x", timestamp: 1 });
    recordLearningEvent({ type: "concept_mastered", itemId: "y", timestamp: 2 });
    expect(getLearningAnalytics().itemsMastered).toBe(2);
  });

  it("calculates 7-day retention rate", () => {
    recordLearningEvent({ type: "review_correct", itemId: "a", timestamp: 1, daysSinceLastSeen: 10 });
    recordLearningEvent({ type: "review_incorrect", itemId: "b", timestamp: 2, daysSinceLastSeen: 8 });
    // 1 correct out of 2 attempts at 7+ days = 50%
    expect(getLearningAnalytics().retentionRate7Day).toBe(50);
  });

  it("trims events at 1000 max", () => {
    for (let i = 0; i < 1010; i++) {
      recordLearningEvent({ type: "first_correct", itemId: `item-${i}`, timestamp: i });
    }
    const raw = JSON.parse(store["red_team_arena_analytics"]);
    expect(raw.length).toBeLessThanOrEqual(1000);
  });

  it("handles corrupted analytics JSON", () => {
    store["red_team_arena_analytics"] = "{broken";
    expect(getLearningAnalytics().totalItemsSeen).toBe(0);
  });
});
