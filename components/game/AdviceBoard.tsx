"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Eye, RefreshCw, Sparkles } from "lucide-react";
import type { PublicGameAdvice } from "@/types/game";
import { useGameLanguage } from "./GameLanguageProvider";

type GameError = "load" | "reveal" | null;

export function AdviceBoard() {
  const reduceMotion = useReducedMotion();
  const { copy } = useGameLanguage();
  const [entries, setEntries] = useState<PublicGameAdvice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [choosingId, setChoosingId] = useState<string | null>(null);
  const [error, setError] = useState<GameError>(null);

  const loadAdvice = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);

    try {
      const response = await fetch("/api/game/advice", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Advice loading failed");
      }

      const data = (await response.json()) as PublicGameAdvice[];
      setEntries(data);
    } catch {
      setError("load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAdvice();
  }, [loadAdvice]);

  const chooseAdvice = async (id: string) => {
    setChoosingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/game/advice/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Advice reveal failed");
      }

      const chosen = (await response.json()) as PublicGameAdvice;
      setEntries((current) =>
        current.map((entry) => (entry.id === chosen.id ? chosen : entry))
      );
    } catch {
      setError("reveal");
    } finally {
      setChoosingId(null);
    }
  };

  const chosenCount = entries.filter((entry) => entry.chosenAt).length;

  return (
    <section aria-labelledby="advice-list-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-[#7441a2]/15 pb-5">
        <div>
          <h2
            id="advice-list-title"
            className="[font-family:var(--font-cormorant-garamond)] text-3xl font-semibold text-[#3c1c59]"
          >
            {copy.listTitle}
          </h2>
          {!loading ? (
            <p className="mt-1 text-sm text-[#8a6b9f]">
              {copy.adviceSummary(entries.length, chosenCount)}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void loadAdvice(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 rounded-full border border-[#7441a2]/20 bg-white/60 px-4 py-2.5 text-sm font-semibold text-[#65447e] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7441a2] disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw
            aria-hidden="true"
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {copy.refresh}
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#fff0f4] px-5 py-4 text-sm text-[#9a3152]"
        >
          <span>{error === "load" ? copy.loadError : copy.revealError}</span>
          <button
            type="button"
            onClick={() => void loadAdvice(true)}
            className="font-semibold underline underline-offset-4"
          >
            {copy.retry}
          </button>
        </div>
      ) : null}

      {loading ? (
        <div aria-label={copy.loadingLabel} className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-3xl border border-[#7441a2]/10 bg-white/55"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="grid min-h-72 place-items-center rounded-[2rem] border border-dashed border-[#7441a2]/25 bg-white/45 px-6 text-center">
          <div>
            <Sparkles aria-hidden="true" className="mx-auto h-7 w-7 text-[#8d62aa]" />
            <h3 className="mt-4 [font-family:var(--font-cormorant-garamond)] text-3xl font-semibold text-[#3c1c59]">
              {copy.emptyTitle}
            </h3>
            <p className="mt-2 text-sm text-[#806493]">
              {copy.emptyText}
            </p>
          </div>
        </div>
      ) : (
        <motion.ol
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: reduceMotion ? 0 : 0.07 },
            },
          }}
          className="overflow-hidden rounded-[2rem] border border-[#7441a2]/15 bg-white/68 shadow-[0_28px_70px_rgba(72,34,102,0.1)] backdrop-blur-md"
        >
          {entries.map((entry, index) => {
            const isChosen = Boolean(entry.chosenAt && entry.guestName);
            const isChoosing = choosingId === entry.id;

            return (
              <motion.li
                key={entry.id}
                layout
                variants={{
                  hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className="group relative grid gap-5 border-b border-[#7441a2]/10 px-5 py-7 last:border-b-0 sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:px-7 sm:py-8"
              >
                <span className="[font-family:var(--font-cormorant-garamond)] text-2xl text-[#b39ac4] tabular-nums sm:text-center">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <blockquote className="[font-family:var(--font-cormorant-garamond)] text-2xl leading-snug font-medium text-[#3c1c59] sm:text-3xl">
                    “{entry.advice}”
                  </blockquote>

                  <AnimatePresence initial={false}>
                    {isChosen ? (
                      <motion.p
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 flex items-center gap-2 text-sm font-semibold tracking-[0.08em] text-[#6b388e] uppercase"
                      >
                        <Check aria-hidden="true" className="h-4 w-4" />
                        {entry.guestName}
                      </motion.p>
                    ) : (
                      <p className="mt-4 text-xs font-medium tracking-[0.14em] text-[#a087b1] uppercase">
                        {copy.authorSecret}
                      </p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="sm:pl-5">
                  {isChosen ? (
                    <span className="inline-flex items-center rounded-full bg-[#eee3f8] px-4 py-2 text-xs font-semibold text-[#6b388e]">
                      {copy.chosen}
                    </span>
                  ) : (
                    <motion.button
                      type="button"
                      disabled={isChoosing || choosingId !== null}
                      onClick={() => void chooseAdvice(entry.id)}
                      whileHover={reduceMotion ? undefined : { x: 2 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      className="inline-flex min-w-36 items-center justify-center gap-2 rounded-full border border-[#7441a2]/25 bg-white px-4 py-3 text-sm font-semibold text-[#5d2c83] transition-colors hover:border-[#7441a2]/45 hover:bg-[#f3ebf9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7441a2] disabled:cursor-wait disabled:opacity-55"
                    >
                      <Eye aria-hidden="true" className="h-4 w-4" />
                      {isChoosing ? copy.revealing : copy.choose}
                    </motion.button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </motion.ol>
      )}
    </section>
  );
}
