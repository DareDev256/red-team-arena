"use client";

import { useSyncExternalStore } from "react";

interface GlitchTextProps {
  children: string;
  as?: "span" | "p" | "div";
  className?: string;
  /** Higher intensity = more frequent desync */
  intensity?: "idle" | "active";
  /** Show binary ghost on hover */
  binary?: boolean;
}

function toBinary(text: string): string {
  return text
    .slice(0, 12)
    .split("")
    .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Terminal text with quantum glitch desync effect.
 * Occasionally splits RGB channels and jitters position,
 * creating the illusion of unstable, processing data.
 */
export function GlitchText({
  children,
  as: Tag = "span",
  className = "",
  intensity = "idle",
  binary = false,
}: GlitchTextProps) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const glitchClass =
    intensity === "active" ? "quantum-glitch-active" : "quantum-glitch";

  if (!mounted) {
    return <Tag className={className}>{children}</Tag>;
  }

  const combinedClass = binary
    ? `binary-ghost ${glitchClass} ${className}`
    : `${glitchClass} ${className}`;

  return (
    <Tag className={combinedClass} {...(binary ? { "data-binary": toBinary(children) } : {})}>
      {children}
    </Tag>
  );
}
