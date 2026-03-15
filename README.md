# RED TEAM ARENA

**Break the AI. Learn to Protect It.**

An educational browser game that teaches AI safety through ethical prompt injection challenges. Like a cybersecurity CTF, but for AI guardrails.

## Features

- **Hacker terminal interface** — green-on-black monospace with matrix rain background
- **5 starter challenges** across Basic Injection and Role Play attack categories
- **Pattern-matching response engine** — no API keys needed, all responses are pre-scripted
- **Quantum glitch effects** — RGB channel desync, cursor jitter, and binary ghost overlays on terminal text
- **Encrypted artifact buttons** — hover triggers scan-line reveal animation on interactive elements
- **Breach visualization** — screen glitch effect when guardrails break
- **Educational debriefs** — every challenge explains the attack, defense, and real-world impact
- **Scoring system** — points based on attack sophistication with transparent retry penalties
- **CRT scanline overlay** — authentic retro terminal feel

## Tech Stack

- Next.js 16 + React 19 + TypeScript (strict)
- Tailwind CSS v4 (CSS-first `@theme inline`)
- Framer Motion for animations
- localStorage persistence (SSR-safe)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm run lint       # ESLint check
npm test           # Run test suite (128 tests)
npm run test:watch # Watch mode
```

## How It Works

Each challenge defines an AI system with specific guardrails and a set of vulnerability patterns (regex). The player writes adversarial prompts that are tested against these patterns. Matches trigger tiered responses — partial breaks or full breaches — with corresponding visual feedback.

No real AI APIs are called. All "AI responses" are pre-written, making this safe to deploy anywhere with zero cost.

## Ethical Framing

This teaches security through hands-on practice, following the CTF (Capture The Flag) model used in cybersecurity education. Every challenge concludes with defensive insights.

---

**Passionate Learning Game #6** by DareDev256
