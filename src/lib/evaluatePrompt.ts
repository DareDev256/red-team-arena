import { RedTeamChallenge, BreakResult } from "@/types/redteam";

/** Core response engine: tests user input against challenge vulnerability patterns */
export function evaluatePrompt(challenge: RedTeamChallenge, input: string): BreakResult {
  const lower = input.toLowerCase();
  for (const v of challenge.vulnerabilities) {
    if (new RegExp(v.pattern, "i").test(lower)) {
      return {
        level: v.breakLevel,
        response: v.response,
        technique: v.technique,
        points: v.breakLevel === "full" ? 20 : 8,
      };
    }
  }
  return { level: "none", response: challenge.defaultResponse, points: 0 };
}
