"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { challenges } from "@/data/curriculum";
import { BreakResult } from "@/types/redteam";
import { addXP } from "@/lib/storage";
import { evaluatePrompt } from "@/lib/evaluatePrompt";

type Phase = "prompt" | "scanning" | "result" | "debrief";

export default function PlayPage() {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("prompt");
  const [result, setResult] = useState<BreakResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const challenge = challenges[idx];

  useEffect(() => {
    if (phase === "prompt") inputRef.current?.focus();
  }, [phase, idx]);

  if (!challenge) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="font-pixel text-sm text-game-primary neon-glow">MISSION COMPLETE</p>
          <p className="font-pixel text-xs text-game-accent mt-4">Score: {totalScore} pts</p>
          <Link href="/" className="font-pixel text-xs text-game-primary/60 mt-8 block hover:text-game-primary">[RETURN TO BASE]</Link>
        </div>
      </main>
    );
  }

  const submit = () => {
    if (!input.trim() || phase !== "prompt") return;
    setPhase("scanning");
    setAttempts((a) => a + 1);
    setTimeout(() => {
      const r = evaluatePrompt(challenge, input);
      setResult(r);
      if (r.level === "full") {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 900);
      }
      setPhase("result");
      if (r.points > 0) {
        const pts = attempts === 0 ? r.points : Math.max(r.points - 5, 3);
        setTotalScore((s) => s + pts);
        addXP(pts);
      }
    }, 1200);
  };

  const next = () => {
    setPhase("prompt");
    setInput("");
    setResult(null);
    setAttempts(0);
    setIdx((i) => i + 1);
  };

  const retry = () => {
    setPhase("prompt");
    setInput("");
    setResult(null);
  };

  return (
    <main className={`min-h-screen p-4 md:p-8 relative ${glitch ? "glitch-active" : ""}`}>
      <div className="matrix-bg" />
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="font-pixel text-[8px] text-game-primary/50 hover:text-game-primary">&lt; EXIT</Link>
          <p className="font-pixel text-[8px] text-game-accent">{totalScore} PTS</p>
          <p className="font-pixel text-[8px] text-game-primary/40">{idx + 1}/{challenges.length}</p>
        </div>

        {/* Target AI Card */}
        <div className="border border-game-primary/30 p-4 mb-4 bg-game-dark/80">
          <p className="font-pixel text-[8px] text-game-secondary mb-2">TARGET SYSTEM</p>
          <p className="font-pixel text-[10px] text-game-primary/90 leading-relaxed">{challenge.prompt}</p>
          <div className="mt-3 border-t border-game-primary/20 pt-3">
            <p className="font-pixel text-[8px] text-game-accent/70">GUARDRAIL: {challenge.guardrail}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Prompt Input */}
          {phase === "prompt" && (
            <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-pixel text-[8px] text-game-primary/60 mb-2">root@redteam:~$ <span className="terminal-cursor" /></p>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
                placeholder="Type your adversarial prompt..."
                className="w-full bg-black/60 border border-game-primary/30 text-game-primary font-pixel text-[10px] p-3 min-h-[80px] resize-none focus:border-game-primary focus:outline-none placeholder:text-game-primary/20"
                aria-label="Enter your adversarial prompt"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="font-pixel text-[8px] text-game-primary/30">SHIFT+ENTER for newline</p>
                <button onClick={submit} disabled={!input.trim()} className="font-pixel text-[8px] bg-game-primary text-game-black px-4 py-2 hover:bg-game-primary/80 disabled:opacity-30 disabled:cursor-not-allowed">
                  INJECT &gt;&gt;
                </button>
              </div>
            </motion.div>
          )}

          {/* Scanning Animation */}
          {phase === "scanning" && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <p className="font-pixel text-[10px] text-game-accent animate-pulse-neon">SCANNING PROMPT...</p>
              <div className="mt-4 mx-auto w-48 h-1 bg-game-dark overflow-hidden">
                <motion.div className="h-full bg-game-accent" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1 }} />
              </div>
            </motion.div>
          )}

          {/* Result */}
          {phase === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`border p-4 mb-4 ${result.level === "full" ? "border-game-secondary bg-game-secondary/5" : result.level === "partial" ? "border-game-warning/50 bg-game-warning/5" : "border-game-primary/30 bg-game-dark/50"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-pixel text-[8px] ${result.level === "full" ? "text-game-secondary" : result.level === "partial" ? "text-game-warning" : "text-game-primary"}`}>
                    {result.level === "full" ? "◆ BREACH DETECTED" : result.level === "partial" ? "◇ PARTIAL BREAK" : "● GUARDRAIL HELD"}
                  </span>
                  {result.technique && <span className="font-pixel text-[8px] text-game-accent/60">— {result.technique}</span>}
                </div>
                <p className="font-pixel text-[10px] text-white/80 leading-relaxed">&gt; {result.response}</p>
                {result.points > 0 && <p className="font-pixel text-[8px] text-game-primary mt-2">+{result.points} pts</p>}
              </div>

              <div className="flex gap-2">
                {result.level !== "full" && <button onClick={retry} className="font-pixel text-[8px] border border-game-primary/30 text-game-primary px-4 py-2 hover:bg-game-primary/10">RETRY</button>}
                <button onClick={() => setPhase("debrief")} className="font-pixel text-[8px] bg-game-accent/20 text-game-accent px-4 py-2 hover:bg-game-accent/30">
                  {result.level === "full" ? "VIEW DEBRIEF" : "SKIP → DEBRIEF"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Debrief — Educational Explanation */}
          {phase === "debrief" && (
            <motion.div key="debrief" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="border border-game-accent/30 p-4 space-y-4 bg-game-dark/60">
                <p className="font-pixel text-[8px] text-game-accent">◈ DEBRIEF</p>
                <div>
                  <p className="font-pixel text-[8px] text-game-secondary mb-1">WHY IT MATTERS</p>
                  <p className="font-pixel text-[9px] text-white/70 leading-relaxed">{challenge.enrichment.whyItMatters}</p>
                </div>
                <div>
                  <p className="font-pixel text-[8px] text-game-warning mb-1">REAL-WORLD CASE</p>
                  <p className="font-pixel text-[9px] text-white/70 leading-relaxed">{challenge.enrichment.realWorldExample}</p>
                </div>
                {challenge.enrichment.proTip && (
                  <div>
                    <p className="font-pixel text-[8px] text-game-primary mb-1">DEFENSE TIP</p>
                    <p className="font-pixel text-[9px] text-white/70 leading-relaxed">{challenge.enrichment.proTip}</p>
                  </div>
                )}
              </div>
              <button onClick={next} className="mt-4 font-pixel text-[8px] bg-game-primary text-game-black px-6 py-2 hover:bg-game-primary/80 w-full">
                NEXT TARGET &gt;&gt;
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
