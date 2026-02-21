"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { UserProgress, Category } from "@/types/game";
import {
  getProgress,
  addXP,
  completeLevel,
  updateStreak,
  checkMastery,
} from "@/lib/storage";

// localStorage is an external store — useSyncExternalStore is the correct pattern
const subscribe = () => () => {};
const getServerSnapshot = (): boolean => false;
const getClientSnapshot = (): boolean => true;

export function useProgress(categories?: Category[]) {
  // Hydration gate: false on server, true on client
  const isClient = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [tick, setTick] = useState(0);

  const progress: UserProgress | null = isClient ? getProgress() : null;
  const isLoading = !isClient;

  // Force re-read from localStorage after mutations
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Suppress unused var lint — tick drives re-renders on refresh()
  void tick;

  const earnXP = useCallback((amount: number) => {
    const updated = addXP(amount);
    refresh();
    return updated;
  }, [refresh]);

  const finishLevel = useCallback(
    (categoryId: string, levelId: number) => {
      const updated = completeLevel(categoryId, levelId);
      refresh();
      return updated;
    },
    [refresh]
  );

  const refreshStreak = useCallback(() => {
    const updated = updateStreak();
    refresh();
    return updated;
  }, [refresh]);

  const isLevelUnlocked = useCallback(
    (categoryId: string, levelId: number) => {
      if (!progress) return false;
      if (levelId === 1) return true;
      const prevKey = `${categoryId}-${levelId - 1}`;
      return progress.completedLevels.includes(prevKey) && checkMastery(prevKey);
    },
    [progress]
  );

  const isCategoryUnlocked = useCallback(
    (categoryId: string) => {
      if (!progress || !categories) return true;
      const idx = categories.findIndex((c) => c.id === categoryId);
      if (idx <= 0) return true;
      const prevCategory = categories[idx - 1];
      return prevCategory.levels.every((level) =>
        progress.completedLevels.includes(`${prevCategory.id}-${level.id}`)
      );
    },
    [progress, categories]
  );

  return {
    progress,
    isLoading,
    earnXP,
    finishLevel,
    refreshStreak,
    isLevelUnlocked,
    isCategoryUnlocked,
  };
}
