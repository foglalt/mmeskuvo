import type { ReactNode } from "react";
import type { Metadata } from "next";
import { GameShell } from "@/components/game/GameShell";

export const metadata: Metadata = {
  title: "Jótanács játék | M & M",
  description: "Névtelen jótanácsok M & M közös életéhez.",
};

export default function GameLayout({ children }: { children: ReactNode }) {
  return <GameShell>{children}</GameShell>;
}
