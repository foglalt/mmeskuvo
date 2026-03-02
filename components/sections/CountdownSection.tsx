"use client";

import { useEffect, useMemo, useState } from "react";

const BUDAPEST_TIME_ZONE = "Europe/Budapest";
const TARGET_MONTH = 6;
const TARGET_DAY = 7;
const TARGET_HOUR = 14;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

interface CountdownSectionProps {
  translations: {
    title: string;
    daysLabel: string;
    hoursLabel: string;
  };
}

type CountdownDisplay = {
  value: string;
  label: string;
};

const budapestFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: BUDAPEST_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function getBudapestDateParts(now: Date) {
  const parts = budapestFormatter.formatToParts(now);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
    second: getPart("second"),
  };
}

function getCountdownDisplay(
  now: Date,
  translations: CountdownSectionProps["translations"]
): CountdownDisplay {
  const current = getBudapestDateParts(now);
  const isJuneSeventh =
    current.month === TARGET_MONTH && current.day === TARGET_DAY;

  if (isJuneSeventh) {
    const hoursLeft = Math.max(
      0,
      TARGET_HOUR - (current.hour + current.minute / 60 + current.second / 3600)
    );
    const roundedHours =
      Math.round(hoursLeft * 10) % 10 === 0
        ? String(Math.round(hoursLeft))
        : hoursLeft.toFixed(1);

    return {
      value: roundedHours,
      label: translations.hoursLabel,
    };
  }

  const todayUtc = Date.UTC(current.year, current.month - 1, current.day);
  const targetThisYearUtc = Date.UTC(current.year, TARGET_MONTH - 1, TARGET_DAY);
  const targetYear = todayUtc > targetThisYearUtc ? current.year + 1 : current.year;
  const targetUtc = Date.UTC(targetYear, TARGET_MONTH - 1, TARGET_DAY);
  const daysLeft = Math.max(0, Math.floor((targetUtc - todayUtc) / DAY_IN_MS));

  return {
    value: String(daysLeft),
    label: translations.daysLabel,
  };
}

export function CountdownSection({ translations }: CountdownSectionProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const display = useMemo(
    () => getCountdownDisplay(now, translations),
    [now, translations]
  );

  return (
    <section className="bg-primary/5 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-primary/70 md:text-sm">
          {translations.title}
        </p>
        <p className="mt-6 font-serif text-primary leading-none text-[clamp(5rem,24vw,14rem)] tabular-nums">
          {display.value}
        </p>
        <p className="mt-4 font-serif text-2xl text-primary/85 md:text-4xl">
          {display.label}
        </p>
      </div>
    </section>
  );
}
