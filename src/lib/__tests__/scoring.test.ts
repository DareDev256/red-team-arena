import { describe, it, expect } from "vitest";
import { calculateScore, getBreachDisplay } from "../scoring";

describe("calculateScore", () => {
  it("returns full points on first attempt", () => {
    expect(calculateScore(20, 0)).toBe(20);
    expect(calculateScore(8, 0)).toBe(8);
  });

  it("applies -5 retry penalty on subsequent attempts", () => {
    expect(calculateScore(20, 1)).toBe(15);
    expect(calculateScore(8, 1)).toBe(3);
  });

  it("floors at 3 points minimum", () => {
    expect(calculateScore(8, 1)).toBe(3);
    expect(calculateScore(5, 1)).toBe(3);
  });

  it("returns 0 when base points are 0 regardless of attempts", () => {
    expect(calculateScore(0, 0)).toBe(0);
    expect(calculateScore(0, 3)).toBe(0);
  });

  it("returns 0 for negative base points", () => {
    expect(calculateScore(-5, 0)).toBe(0);
  });
});

describe("getBreachDisplay", () => {
  it("returns full breach styling for 'full' level", () => {
    const d = getBreachDisplay("full");
    expect(d.tier).toBe("full");
    expect(d.label).toBe("BREACH DETECTED");
    expect(d.icon).toBe("◆");
    expect(d.colorClass).toContain("secondary");
    expect(d.borderClass).toContain("secondary");
  });

  it("returns partial breach styling for 'partial' level", () => {
    const d = getBreachDisplay("partial");
    expect(d.tier).toBe("partial");
    expect(d.label).toBe("PARTIAL BREAK");
    expect(d.icon).toBe("◇");
    expect(d.colorClass).toContain("warning");
  });

  it("returns guardrail-held styling for 'none' level", () => {
    const d = getBreachDisplay("none");
    expect(d.tier).toBe("none");
    expect(d.label).toBe("GUARDRAIL HELD");
    expect(d.icon).toBe("●");
    expect(d.colorClass).toContain("primary");
  });
});
