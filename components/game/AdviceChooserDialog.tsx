"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Heart, X } from "lucide-react";
import type { GameCopy } from "@/lib/gameTranslations";
import type { GameAdviceChooser, PublicGameAdvice } from "@/types/game";

interface AdviceChooserDialogProps {
  advice: PublicGameAdvice;
  copy: GameCopy;
  error: boolean;
  savingChooser: GameAdviceChooser | null;
  onChoose: (chooser: GameAdviceChooser) => void;
  onClose: () => void;
}

export function AdviceChooserDialog({
  advice,
  copy,
  error,
  savingChooser,
  onChoose,
  onClose,
}: AdviceChooserDialogProps) {
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const isSaving = savingChooser !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    const firstAvailableButton = dialog?.querySelector<HTMLButtonElement>(
      "button[data-choice]:not(:disabled)"
    );
    firstAvailableButton?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose]);

  const choices: Array<{
    role: GameAdviceChooser;
    label: string;
    selected: boolean;
  }> = [
    {
      role: "bride",
      label: copy.brideLabel,
      selected: Boolean(advice.brideChosenAt),
    },
    {
      role: "groom",
      label: copy.groomLabel,
      selected: Boolean(advice.groomChosenAt),
    },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-[#271337]/55 px-5 py-8 backdrop-blur-sm"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="advice-chooser-title"
        aria-describedby="advice-chooser-description"
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.985 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg rounded-[2rem] border border-white/60 bg-[#fcf9ff] p-6 shadow-[0_30px_100px_rgba(39,19,55,0.35)] sm:p-8"
      >
        <button
          type="button"
          aria-label={copy.cancel}
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-full text-[#806493] transition-colors hover:bg-[#eee3f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7441a2] disabled:opacity-50"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>

        <p className="pr-12 text-xs font-semibold tracking-[0.2em] text-[#8a6b9f] uppercase">
          Jimena &amp; David
        </p>
        <h3
          id="advice-chooser-title"
          className="mt-3 [font-family:var(--font-cormorant-garamond)] text-4xl leading-tight font-semibold text-[#3c1c59]"
        >
          {copy.chooserTitle}
        </h3>
        <p
          id="advice-chooser-description"
          className="mt-3 text-sm leading-6 text-[#806493]"
        >
          {copy.chooserText}
        </p>

        <blockquote className="mt-6 border-l-2 border-[#b995cf] pl-4 [font-family:var(--font-cormorant-garamond)] text-xl leading-relaxed text-[#55336c]">
          “{advice.advice}”
        </blockquote>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {choices.map((choice) => (
            <motion.button
              key={choice.role}
              type="button"
              data-choice={choice.role}
              aria-pressed={choice.selected}
              disabled={isSaving || choice.selected}
              onClick={() => onChoose(choice.role)}
              whileHover={reduceMotion || choice.selected ? undefined : { y: -2 }}
              whileTap={reduceMotion || choice.selected ? undefined : { scale: 0.985 }}
              className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-[#7441a2]/20 bg-white px-4 py-4 text-center text-sm font-semibold text-[#5d2c83] shadow-[0_8px_24px_rgba(72,34,102,0.08)] transition-colors hover:border-[#7441a2]/45 hover:bg-[#f5eefb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7441a2] disabled:cursor-default disabled:bg-[#eee7f3] disabled:text-[#9176a3]"
            >
              {choice.selected ? (
                <Check aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Heart aria-hidden="true" className="h-5 w-5" />
              )}
              <span>
                {savingChooser === choice.role ? copy.saving : choice.label}
              </span>
            </motion.button>
          ))}
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-center text-sm text-[#9a3152]">
            {copy.choiceError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="mx-auto mt-5 block rounded-full px-5 py-2.5 text-sm font-semibold text-[#806493] transition-colors hover:bg-[#eee3f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7441a2] disabled:opacity-50"
        >
          {copy.cancel}
        </button>
      </motion.div>
    </motion.div>
  );
}
