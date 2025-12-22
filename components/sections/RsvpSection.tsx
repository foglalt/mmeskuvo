"use client";

import { SectionWrapper } from "@/components/content/SectionWrapper";
import { RsvpForm } from "@/components/forms/RsvpForm";
import type { SupportContent } from "@/types/content";

interface RsvpSectionProps {
  volunteerOptions: SupportContent["volunteerOptions"];
  translations: {
    title: string;
    namePlaceholder: string;
    addGuest: string;
    phonePlaceholder: string;
    accommodation: string;
    transport: string;
    volunteerTitle: string;
    comments: string;
    submit: string;
    success: string;
    error: string;
  };
}

export function RsvpSection({ volunteerOptions, translations }: RsvpSectionProps) {
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
          translations={translations}
        />
      </div>
    </SectionWrapper>
  );
}
