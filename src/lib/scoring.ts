import type { BreakResult } from "@/types/redteam";

/** Breach severity tiers for display styling */
export type BreachTier = "full" | "partial" | "none";

/** Display metadata for a breach result */
export interface BreachDisplay {
  tier: BreachTier;
  label: string;
  icon: string;
  colorClass: string;
  borderClass: string;
}

/** Map a break result to its display metadata — single source of truth for result styling */
export function getBreachDisplay(level: BreakResult["level"]): BreachDisplay {
  switch (level) {
    case "full":
      return {
        tier: "full",
        label: "BREACH DETECTED",
        icon: "◆",
        colorClass: "text-game-secondary",
        borderClass: "border-game-secondary bg-game-secondary/5",
      };
    case "partial":
      return {
        tier: "partial",
        label: "PARTIAL BREAK",
        icon: "◇",
        colorClass: "text-game-warning",
        borderClass: "border-game-warning/50 bg-game-warning/5",
      };
    default:
      return {
        tier: "none",
        label: "GUARDRAIL HELD",
        icon: "●",
        colorClass: "text-game-primary",
        borderClass: "border-game-primary/30 bg-game-dark/50",
      };
  }
}

/**
 * Calculate awarded points with retry penalty.
 *
 * First attempt: full points (20 for full breach, 8 for partial).
 * Subsequent attempts: -5 penalty per retry, floor at 3.
 * No breach: always 0.
 */
export function calculateScore(basePoints: number, attemptNumber: number): number {
  if (basePoints <= 0) return 0;
  if (attemptNumber === 0) return basePoints;
  return Math.max(basePoints - 5, 3);
}
