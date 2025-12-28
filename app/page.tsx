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
import { useLanguage } from "@/hooks/useLanguage";
import type { SiteContent, ThemeConfig } from "@/types/content";

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
    mainText: "# Hamarosan\n\nAz eskuvoi informaciok hamarosan elerhetok lesznek.",
    subsections: [],
  },
  support: {
    intro: "",
    options: [],
    volunteerOptions: [],
  },
  about: {
    story: "",
    images: [],
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
    volunteerTitle: t("rsvp.volunteerTitle"),
    commentsLabel: t("rsvp.commentsLabel"),
    commentsPlaceholder: t("rsvp.comments"),
    supportLink: t("rsvp.supportLink"),
    submit: t("rsvp.submit"),
    success: t("rsvp.success"),
    error: t("rsvp.error"),
  };

  const [content, setContent] = useState(defaultContent);

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
        <HeroSection content={content.hero} />
        <InfoSection content={content.info} />
        <RsvpSection
          volunteerOptions={content.support.volunteerOptions}
          language={language}
          translations={rsvpTranslations}
        />
        <SupportSection
          content={content.support}
          title={t("support.title")}
          moreInfoLabel={t("support.moreInfo")}
        />
        <AboutSection
          content={content.about}
          title={t("about.title")}
        />
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


