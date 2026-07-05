"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Feather } from "lucide-react";
import { useGameLanguage } from "./GameLanguageProvider";

type FormStatus = "idle" | "submitting" | "success";

export function AdviceForm() {
  const reduceMotion = useReducedMotion();
  const { copy } = useGameLanguage();
  const [guestName, setGuestName] = useState("");
  const [advice, setAdvice] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [hasError, setHasError] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setHasError(false);

    try {
      const response = await fetch("/api/game/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName, advice }),
      });

      if (!response.ok) {
        throw new Error("Advice submission failed");
      }

      setStatus("success");
    } catch {
      setHasError(true);
      setStatus("idle");
    }
  };

  const resetForm = () => {
    setGuestName("");
    setAdvice("");
    setHasError(false);
    setStatus("idle");
  };

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-20">
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xl"
      >
        <h1 className="[font-family:var(--font-cormorant-garamond)] text-5xl leading-[0.95] font-medium tracking-[-0.04em] text-[#3c1c59] sm:text-7xl">
          {copy.guestTitle.split("\n").map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-7 max-w-md text-base leading-7 text-[#745789] sm:text-lg">
          {copy.guestIntro}
        </p>

        <div className="mt-10 flex items-center gap-4 text-sm text-[#805c9b]">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[#a77fc3]/40 bg-white/60">
            <Feather aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="max-w-[16rem] leading-5">
            {copy.guestNote}
          </span>
        </div>
      </motion.section>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 34, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: reduceMotion ? 0 : 0.12,
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative overflow-hidden rounded-[2rem] border border-[#7441a2]/15 bg-white/75 p-6 shadow-[0_30px_80px_rgba(72,34,102,0.13)] backdrop-blur-md sm:p-10"
      >
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#d8c3e9]/35 blur-2xl"
        />

        <AnimatePresence mode="wait" initial={false}>
          {status === "success" ? (
            <motion.div
              key="success"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
              className="relative flex min-h-[30rem] flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={reduceMotion ? false : { scale: 0.6, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="mb-7 grid h-16 w-16 place-items-center rounded-full bg-[#5d2c83] text-white shadow-[0_12px_35px_rgba(93,44,131,0.3)]"
              >
                <Check aria-hidden="true" className="h-7 w-7" strokeWidth={2} />
              </motion.div>
              <p className="text-xs font-semibold tracking-[0.23em] text-[#805c9b] uppercase">
                {copy.successKicker}
              </p>
              <h2 className="mt-4 [font-family:var(--font-cormorant-garamond)] text-5xl font-medium tracking-[-0.03em] text-[#3c1c59]">
                {copy.successTitle}
              </h2>
              <p className="mt-4 max-w-sm leading-7 text-[#745789]">
                {copy.successText}
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="mt-9 rounded-full border border-[#7441a2]/30 px-5 py-3 text-sm font-semibold text-[#5d2c83] transition-colors hover:bg-[#f0e7f8] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#7441a2]"
              >
                {copy.submitAnother}
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
              onSubmit={handleSubmit}
              className="relative"
            >
              <div className="mb-9">
                <p className="text-xs font-semibold tracking-[0.23em] text-[#805c9b] uppercase">
                  {copy.formKicker}
                </p>
                <h2 className="mt-3 [font-family:var(--font-cormorant-garamond)] text-4xl font-medium tracking-[-0.03em] text-[#3c1c59] sm:text-5xl">
                  {copy.formTitle}
                </h2>
              </div>

              <div className="space-y-7">
                <div>
                  <label
                    htmlFor="game-guest-name"
                    className="mb-2 block text-sm font-semibold text-[#4f2c68]"
                  >
                    {copy.nameLabel}
                  </label>
                  <input
                    id="game-guest-name"
                    name="guestName"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={120}
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    placeholder={copy.namePlaceholder}
                    className="w-full rounded-2xl border border-[#7441a2]/20 bg-[#fcfaff] px-4 py-3.5 text-[#32194f] outline-none transition placeholder:text-[#a991b9] focus:border-[#7441a2]/60 focus:ring-4 focus:ring-[#7441a2]/10"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-end justify-between gap-4">
                    <label
                      htmlFor="game-advice"
                      className="block text-sm font-semibold text-[#4f2c68]"
                    >
                      {copy.adviceLabel}
                    </label>
                    <span className="text-xs tabular-nums text-[#9a7bad]">
                      {advice.length}/1200
                    </span>
                  </div>
                  <textarea
                    id="game-advice"
                    name="advice"
                    required
                    minLength={5}
                    maxLength={1200}
                    rows={7}
                    value={advice}
                    onChange={(event) => setAdvice(event.target.value)}
                    placeholder={copy.advicePlaceholder}
                    className="w-full resize-y rounded-2xl border border-[#7441a2]/20 bg-[#fcfaff] px-4 py-3.5 leading-7 text-[#32194f] outline-none transition placeholder:text-[#a991b9] focus:border-[#7441a2]/60 focus:ring-4 focus:ring-[#7441a2]/10"
                  />
                </div>
              </div>

              {hasError ? (
                <p
                  role="alert"
                  className="mt-5 rounded-xl bg-[#fff0f4] px-4 py-3 text-sm text-[#9a3152]"
                >
                  {copy.submitError}
                </p>
              ) : null}

              <motion.button
                type="submit"
                disabled={status === "submitting"}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#5d2c83] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(93,44,131,0.25)] transition-colors hover:bg-[#4d226f] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#7441a2] disabled:cursor-wait disabled:opacity-65"
              >
                {status === "submitting" ? copy.submitting : copy.submit}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  );
}
