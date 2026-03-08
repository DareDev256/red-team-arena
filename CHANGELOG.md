# Changelog

## [0.3.0] — 2026-03-08

### Added
- Quantum glitch system: `text-desync` keyframes with RGB channel splitting (red/cyan shadow offsets) for terminal text
- `GlitchText` component with idle/active intensity modes and binary ghost hover overlay
- `cursor-jitter` animation replacing static terminal cursor with micro-jitter effect
- `artifact-encrypt` CSS class: hover-triggered scan-line reveal animation on all action buttons
- `binary-ghost` CSS class: shows binary representation of text on hover
- Applied quantum glitch to play page (terminal prompt, scanning phase, target system label, debrief header)
- Applied artifact-encrypt to all interactive buttons (INJECT, RETRY, VIEW DEBRIEF, NEXT TARGET)
- Landing page tagline now uses GlitchText with binary ghost effect
- All new animations respect `prefers-reduced-motion: reduce`

## [0.2.2] — 2026-03-06

### Added
- 33 new tests covering previously untested functions (67 total, up from 34)
- Streak system tests: date logic, freeze consumption, first-play initialization
- `updateItemScore` tests: score creation, independent tracking, timestamp accuracy
- `getItemsForReview` tests: FSRS-to-naive fallback path, limit parameter
- Learning analytics pipeline tests: event recording, retention rate calculation, 1000-event trim
- Curriculum query tests: `getChallengesByCategory`, `getItemsByLevel`, referential integrity
- `evaluatePrompt` edge cases: empty input, regex metacharacters, long strings, unicode

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
