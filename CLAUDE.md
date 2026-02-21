# CLAUDE.md — Red Team Arena

## Project: Passionate Learning Game #6
A web-based educational game that teaches AI safety through ethical prompt injection challenges.

## Game Identity
- **Title**: RED TEAM ARENA
- **Subtitle**: Break the AI. Learn to Protect It.
- **Tagline**: HACK THE SYSTEM
- **Storage key prefix**: `red_team_arena`

## Full Spec
Read `/Users/tdot/Documents/Projects/passionate-learning/specs/06-red-team-arena.md` for the complete game specification.

## Tech Stack
- Next.js 16 + React 19 + TypeScript (strict)
- Tailwind CSS v4 (CSS-first `@theme inline`)
- Framer Motion for animations
- localStorage persistence (SSR-safe)
- Deploy: Vercel

## Template
Scaffolded from Passionate Learning shared template at `/Users/tdot/Documents/Projects/passionate-learning/template/`.

## Theme Colors
```css
--game-primary: #00ff41;   /* terminal green */
--game-secondary: #ff0040; /* alert red */
--game-accent: #00d4ff;    /* cyan */
--game-dark: #000a00;
```

## Core Mechanic
Player faces AI with specific guardrails → writes adversarial prompts → AI response logic (regex/keyword matching, NOT real API) either holds or breaks → score based on attack sophistication → every challenge ends with defense explanation.

## Build Priority
1. Landing page with hacker terminal theme + matrix rain effect
2. Terminal-style interface (monospace, green-on-black)
3. Challenge display (guardrail description + prompt input)
4. Response engine (pattern matching against vulnerability definitions)
5. Break visualization (screen glitch effect on successful hack)
6. Exploit log (running list of discovered techniques)
7. Full curriculum (96 challenges across 8 attack categories)
8. Defense mode (category 8 — player writes guardrails instead)

## Quality Bar
- Production-grade. No placeholders.
- Zero API keys required — all responses are pattern-matched, not API calls.
- Mobile responsive.
- MUST include educational framing: every challenge explains attack, defense, and real-world impact.
- This is DEFENSIVE education through OFFENSIVE practice (CTF model).

## IMPORTANT: Ethical Framing
- This teaches security through hands-on practice, like cybersecurity CTFs
- Every challenge MUST end with: how the attack worked, how to defend, real-world impact
- No techniques that could be used to cause real harm outside the game context
- All "AI systems" are simulated with pre-written responses, not real APIs

## Commands
```bash
npm run dev    # Development server
npm run build  # Production build
npm run lint   # ESLint check
```
