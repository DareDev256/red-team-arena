import type { Metadata } from "next";
import "@fontsource/press-start-2p";
import "./globals.css";

// OVERRIDE per game
export const metadata: Metadata = {
  title: "Red Team Arena — Break the AI. Learn to Protect It.",
  description: "Learn AI safety through ethical prompt injection challenges — by DareDev256",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-game-black antialiased">
        <div className="crt-overlay" />
        {children}
      </body>
    </html>
  );
}
