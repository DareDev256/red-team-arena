"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { categories, getChallengesByCategory } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";

export default function CategoriesPage() {
  const { progress, isLoading, isCategoryUnlocked, isLevelUnlocked } =
    useProgress(categories);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-pixel text-xs text-game-primary animate-pulse-neon">
          LOADING...
        </p>
      </main>
    );
  }

  const getLevelCompletion = (categoryId: string, levelId: number): boolean => {
    if (!progress) return false;
    return progress.completedLevels.includes(`${categoryId}-${levelId}`);
  };

  const getCategoryCompletion = (categoryId: string): number => {
    if (!progress) return 0;
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat || cat.levels.length === 0) return 0;
    const completed = cat.levels.filter((l) =>
      progress.completedLevels.includes(`${categoryId}-${l.id}`)
    ).length;
    return Math.round((completed / cat.levels.length) * 100);
  };

  const getChallengeCount = (categoryId: string): number => {
    return getChallengesByCategory(categoryId).length;
  };

  return (
    <main className="min-h-screen p-4 md:p-8 relative">
      <div className="matrix-bg" />

      {/* Decorative corners */}
      <div className="fixed top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-game-primary/30" />
      <div className="fixed top-4 right-16 w-8 h-8 border-t-2 border-r-2 border-game-primary/30" />
      <div className="fixed bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-game-primary/30" />
      <div className="fixed bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-game-primary/30" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="font-pixel text-[8px] text-game-primary/50 hover:text-game-primary transition-colors"
          >
            &lt; BACK TO BASE
          </Link>
          {progress && (
            <p className="font-pixel text-[8px] text-game-accent">
              {progress.xp} XP — LVL {progress.level}
            </p>
          )}
        </div>

        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-pixel text-sm md:text-base text-game-primary neon-glow">
            ATTACK CATEGORIES
          </h1>
          <p className="font-pixel text-[8px] text-game-accent/60 mt-2">
            SELECT TARGET VECTOR
          </p>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category, index) => {
            const unlocked = isCategoryUnlocked(category.id);
            const completion = getCategoryCompletion(category.id);
            const challengeCount = getChallengeCount(category.id);
            const isExpanded = expandedId === category.id;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Category Card */}
                <motion.button
                  onClick={() => {
                    if (!unlocked) return;
                    setExpandedId(isExpanded ? null : category.id);
                  }}
                  className={`w-full text-left border p-4 transition-colors ${
                    unlocked
                      ? isExpanded
                        ? "border-game-primary bg-game-primary/5"
                        : "border-game-primary/30 bg-game-dark/80 hover:border-game-primary/60 hover:bg-game-primary/5"
                      : "border-game-primary/10 bg-game-dark/40 cursor-not-allowed"
                  }`}
                  whileHover={unlocked ? { scale: 1.01 } : {}}
                  whileTap={unlocked ? { scale: 0.99 } : {}}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon */}
                      <span
                        className={`font-pixel text-base shrink-0 ${
                          unlocked
                            ? "text-game-primary"
                            : "text-game-primary/20"
                        }`}
                      >
                        {unlocked ? category.icon : "##"}
                      </span>

                      <div className="min-w-0">
                        <h2
                          className={`font-pixel text-[10px] ${
                            unlocked
                              ? "text-game-primary"
                              : "text-game-primary/30"
                          }`}
                        >
                          {unlocked ? category.title : "LOCKED"}
                        </h2>
                        <p
                          className={`font-pixel text-[8px] mt-1 ${
                            unlocked
                              ? "text-white/50"
                              : "text-game-primary/15"
                          }`}
                        >
                          {unlocked
                            ? category.description
                            : "Complete previous category to unlock"}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {unlocked ? (
                        <>
                          <span className="font-pixel text-[8px] text-game-accent/70">
                            {category.levels.length}{" "}
                            {category.levels.length === 1
                              ? "LEVEL"
                              : "LEVELS"}
                          </span>
                          <span className="font-pixel text-[8px] text-game-primary/50">
                            {challengeCount} CHALLENGES
                          </span>
                        </>
                      ) : (
                        <span className="font-pixel text-[8px] text-game-secondary/40">
                          LOCKED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Completion Bar */}
                  {unlocked && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-pixel text-[8px] text-game-primary/40">
                          PROGRESS
                        </span>
                        <span
                          className={`font-pixel text-[8px] ${
                            completion === 100
                              ? "text-game-primary neon-glow"
                              : "text-game-accent/60"
                          }`}
                        >
                          {completion}%
                        </span>
                      </div>
                      <div className="w-full h-1 bg-game-dark/80 border border-game-primary/20 overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            completion === 100
                              ? "bg-game-primary"
                              : "bg-game-accent/60"
                          }`}
                          initial={{ width: "0%" }}
                          animate={{ width: `${completion}%` }}
                          transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Expand indicator */}
                  {unlocked && (
                    <div className="mt-2 text-center">
                      <span className="font-pixel text-[8px] text-game-primary/30">
                        {isExpanded ? "[ COLLAPSE ]" : "[ EXPAND ]"}
                      </span>
                    </div>
                  )}
                </motion.button>

                {/* Expanded Levels */}
                <AnimatePresence>
                  {isExpanded && unlocked && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border border-t-0 border-game-primary/20 bg-game-dark/60 p-3 space-y-2">
                        <p className="font-pixel text-[8px] text-game-secondary/60 mb-2">
                          LEVELS
                        </p>
                        {category.levels.map((level) => {
                          const levelUnlocked = isLevelUnlocked(
                            category.id,
                            level.id
                          );
                          const levelComplete = getLevelCompletion(
                            category.id,
                            level.id
                          );

                          return (
                            <motion.div
                              key={level.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: level.id * 0.05 }}
                            >
                              {levelUnlocked ? (
                                <Link
                                  href={`/play?category=${category.id}&level=${level.id}`}
                                  className={`flex items-center justify-between p-2 border transition-colors ${
                                    levelComplete
                                      ? "border-game-primary/40 bg-game-primary/5"
                                      : "border-game-primary/15 hover:border-game-primary/40 hover:bg-game-primary/5"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-pixel text-[8px] ${
                                        levelComplete
                                          ? "text-game-primary"
                                          : "text-game-accent/50"
                                      }`}
                                    >
                                      {levelComplete ? "[*]" : "[ ]"}
                                    </span>
                                    <span
                                      className={`font-pixel text-[8px] ${
                                        levelComplete
                                          ? "text-game-primary/80"
                                          : "text-white/60"
                                      }`}
                                    >
                                      {level.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-pixel text-[8px] text-game-primary/30">
                                      {level.items.length} CHALLENGES
                                    </span>
                                    <span className="font-pixel text-[8px] text-game-accent/40">
                                      {level.requiredXp > 0
                                        ? `${level.requiredXp} XP`
                                        : "FREE"}
                                    </span>
                                    <span className="font-pixel text-[8px] text-game-primary/40">
                                      &gt;&gt;
                                    </span>
                                  </div>
                                </Link>
                              ) : (
                                <div className="flex items-center justify-between p-2 border border-game-primary/10 bg-game-dark/40">
                                  <div className="flex items-center gap-2">
                                    <span className="font-pixel text-[8px] text-game-primary/15">
                                      [#]
                                    </span>
                                    <span className="font-pixel text-[8px] text-game-primary/20">
                                      {level.name}
                                    </span>
                                  </div>
                                  <span className="font-pixel text-[8px] text-game-secondary/30">
                                    LOCKED — {level.requiredXp} XP REQ
                                  </span>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.p
          className="font-pixel text-[8px] text-game-primary/30 text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {categories.length} CATEGORIES —{" "}
          {categories.reduce((sum, c) => sum + c.levels.length, 0)} LEVELS —{" "}
          {categories.reduce(
            (sum, c) => sum + getChallengeCount(c.id),
            0
          )}{" "}
          CHALLENGES
        </motion.p>
      </div>
    </main>
  );
}
