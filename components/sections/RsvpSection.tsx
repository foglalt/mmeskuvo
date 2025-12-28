"use client";

import { SectionWrapper } from "@/components/content/SectionWrapper";
import { RsvpForm } from "@/components/forms/RsvpForm";
import type { SupportContent } from "@/types/content";

interface RsvpSectionProps {
  volunteerOptions: SupportContent["volunteerOptions"];
  language: "hu" | "en";
  translations: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    addGuest: string;
    phoneLabel: string;
    phonePlaceholder: string;
    accommodation: string;
    transport: string;
    volunteerTitle: string;
    commentsLabel: string;
    commentsPlaceholder: string;
    supportLink: string;
    submit: string;
    success: string;
    error: string;
  };
}

export function RsvpSection({
  volunteerOptions,
  language,
  translations,
}: RsvpSectionProps) {
  return (
    <SectionWrapper id="rsvp" className="bg-white">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">
          {translations.title}
        </h2>
      </div>
      
      <div className="max-w-xl mx-auto">
        <RsvpForm
          volunteerOptions={volunteerOptions}
          language={language}
          translations={translations}
        />
      </div>
    </SectionWrapper>
  );
}
