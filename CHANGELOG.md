# Changelog

## [0.2.1] — 2026-03-05

### Added
- Vitest test suite with 34 tests across response engine and storage layer
- Response engine tests: pattern matching, break levels, scoring, case insensitivity
- Curriculum data integrity tests: regex compilation, required fields, unique IDs
- Storage layer tests: XP system, recall multipliers, mastery gates, FSRS cards, streak freezes
- Extracted `evaluatePrompt` into testable `src/lib/evaluatePrompt.ts` module
- `npm test` and `npm run test:watch` scripts

## [0.2.0] — 2026-02-21

### Added
- Hacker terminal theme with matrix rain CSS background effect
- Terminal-style play page with monospace green-on-black interface
- Challenge display with guardrail descriptions and adversarial prompt input
- Pattern-matching response engine (regex-based, no API calls)
- Breach visualization with CSS glitch animation on successful hacks
- 5 starter challenges across Basic Injection (3) and Role Play Attacks (2)
- Educational debrief after every challenge (attack explanation, defense tips, real-world cases)
- Scoring system: 20 pts for full breach, 8 pts for partial, bonus for first attempt
- RedTeam type system extending base ContentItem with vulnerabilities
- Scanning animation between prompt submission and result reveal

## [0.1.0] — 2026-02-20

### Added
- Initial scaffold from Passionate Learning template
- ESLint 9 flat config
