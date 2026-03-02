"use client";

import { useEffect, useState } from "react";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LanguagePrompt } from "@/components/layout/LanguagePrompt";
import { HeroSection } from "@/components/sections/HeroSection";
import { InfoSection } from "@/components/sections/InfoSection";
import { RsvpSection } from "@/components/sections/RsvpSection";
import { SupportSection } from "@/components/sections/SupportSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { CountdownSection } from "@/components/sections/CountdownSection";
import { useLanguage } from "@/hooks/useLanguage";
import type { SiteContent, ThemeConfig } from "@/types/content";

const PLACEHOLDER_INVITATION_IMAGES = new Set([
  "",
  "/images/invitation-placeholder.svg",
  "/images/invitation-placeholder.jpg",
]);

const DEFAULT_INVITATION_IMAGES = {
  hu: "/images/invitation-hu.jpg",
  en: "/images/invitation-en.jpg",
} as const;

const DEFAULT_ABOUT_IMAGES = [
  { src: "/images/2024_12_21.jpg" },
  { src: "/images/2025_02_05.jpg" },
  { src: "/images/2025_04_20.jpg" },
  { src: "/images/2025_06_22.jpg" },
  { src: "/images/2025_07_15.jpg" },
  { src: "/images/2025_10_06.jpg" },
  { src: "/images/2025_10_26.jpg" },
  { src: "/images/2025_11_09.jpg" },
] as const;

const DEFAULT_VOLUNTEER_OPTIONS = [
  {
    hu: "Szeretnek segiteni az etelek elokesziteseben",
    en: "I'd like to help with the food preparations",
  },
] as const;

// Default content for initial render
const defaultContent: Omit<SiteContent, "id" | "updatedAt"> = {
  theme: {
    primary: "#d4a574",
    secondary: "#f5f0e8",
    accent: "#8b7355",
    fontHeading: "Playfair Display",
    fontBody: "Lora",
  },
  hero: {
    invitationImage: "/images/invitation-placeholder.svg",
    showScrollHint: true,
  },
  info: {
    mainText: {
      hu: "# Udvozlunk!\n\nItt talalod az eskuvonk legfontosabb informacioit, a visszajelzeshez es a tamogatasi lehetosegekhez gorgetve.",
      en: "# Welcome!\n\nHere you can find the most important information about our wedding, RSVP details, and ways to support us.",
    },
    subsections: [],
  },
  support: {
    intro: { hu: "", en: "" },
    options: [],
    volunteerOptions: [...DEFAULT_VOLUNTEER_OPTIONS],
  },
  about: {
    story: { hu: "", en: "" },
    images: [...DEFAULT_ABOUT_IMAGES],
  },
};

function HomePage() {
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { href: "#info", label: t("nav.info") },
    { href: "#rsvp", label: t("nav.rsvp") },
    { href: "#support", label: t("nav.support") },
    { href: "#about", label: t("nav.about") },
  ];

  const rsvpTranslations = {
    title: t("rsvp.title"),
    nameLabel: t("rsvp.name"),
    namePlaceholder: t("rsvp.namePlaceholder"),
    addGuest: t("rsvp.addGuest"),
    phoneLabel: t("rsvp.phone"),
    phonePlaceholder: t("rsvp.phonePlaceholder"),
    accommodation: t("rsvp.accommodation"),
    transport: t("rsvp.transport"),
    help: t("rsvp.help"),
    commentsLabel: t("rsvp.commentsLabel"),
    commentsPlaceholder: t("rsvp.comments"),
    submit: t("rsvp.submit"),
    success: t("rsvp.success"),
    error: t("rsvp.error"),
    alreadySubmittedTitle: t("rsvp.alreadySubmittedTitle"),
    alreadySubmittedDescription: t("rsvp.alreadySubmittedDescription"),
    modify: t("rsvp.modify"),
    summaryName: t("rsvp.summaryName"),
    summaryAdditionalGuests: t("rsvp.summaryAdditionalGuests"),
    summaryPhone: t("rsvp.summaryPhone"),
    summaryAccommodation: t("rsvp.summaryAccommodation"),
    summaryTransport: t("rsvp.summaryTransport"),
    summaryVolunteer: t("rsvp.summaryVolunteer"),
    summaryComments: t("rsvp.summaryComments"),
    summaryYes: t("rsvp.summaryYes"),
    summaryNo: t("rsvp.summaryNo"),
    summaryNone: t("rsvp.summaryNone"),
  };
  const countdownTranslations = {
    title: t("countdown.title"),
    daysLabel: t("countdown.daysLabel"),
    hoursLabel: t("countdown.hoursLabel"),
  };

  const [content, setContent] = useState(defaultContent);

  const heroImage = PLACEHOLDER_INVITATION_IMAGES.has(content.hero.invitationImage)
    ? DEFAULT_INVITATION_IMAGES[language]
    : content.hero.invitationImage;
  const aboutContent =
    content.about.images?.length > 0
      ? content.about
      : { ...content.about, images: [...DEFAULT_ABOUT_IMAGES] };

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setContent(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <LanguagePrompt />
      <Navbar
        items={navItems}
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className="pt-16">
        <HeroSection
          content={{ ...content.hero, invitationImage: heroImage }}
        />
        <InfoSection
          content={content.info}
          language={language}
          title={t("nav.info")}
        />
        <RsvpSection
          language={language}
          translations={rsvpTranslations}
        />
        <SupportSection
          content={content.support}
          language={language}
          title={t("support.title")}
          moreInfoLabel={t("support.moreInfo")}
        />
        <AboutSection content={aboutContent} language={language} title={t("about.title")} />
        <CountdownSection translations={countdownTranslations} />
      </main>

      <Footer />
    </>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<ThemeConfig>(defaultContent.theme);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data?.theme) {
          setTheme(data.theme);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Providers theme={theme}>
      <HomePage />
    </Providers>
  );
}
