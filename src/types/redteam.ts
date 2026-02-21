import { ContentItem, Enrichment } from "./game";

export interface Vulnerability {
  pattern: string;
  breakLevel: "partial" | "full";
  response: string;
  technique: string;
}

export interface RedTeamChallenge extends ContentItem {
  guardrail: string;
  vulnerabilities: Vulnerability[];
  defaultResponse: string;
  enrichment: Enrichment;
}

export type BreakResult = {
  level: "none" | "partial" | "full";
  response: string;
  technique?: string;
  points: number;
};
