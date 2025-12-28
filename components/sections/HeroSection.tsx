"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { HeroContent } from "@/types/content";

interface HeroSectionProps {
  content: HeroContent;
}

const FALLBACK_INVITATION_IMAGE = "/images/invitation-placeholder.svg";
const LEGACY_PLACEHOLDER_IMAGE = "/images/invitation-placeholder.jpg";

export function HeroSection({ content }: HeroSectionProps) {
  const scrollToNext = () => {
    const infoSection = document.getElementById("info");
    infoSection?.scrollIntoView({ behavior: "smooth" });
  };

  const invitationImage =
    content.invitationImage &&
    content.invitationImage !== LEGACY_PLACEHOLDER_IMAGE
      ? content.invitationImage
      : FALLBACK_INVITATION_IMAGE;

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center"
    >
      {/* Background/Invitation Image */}
      <div className="relative h-full w-full max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative aspect-[3/4] w-full"
        >
          <Image
            src={invitationImage}
            alt="Wedding Invitation"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
      </div>

      {/* Scroll hint */}
      {content.showScrollHint && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          onClick={scrollToNext}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary hover:text-accent transition-colors"
          aria-label="Scroll to next section"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ChevronDown className="h-10 w-10" />
          </motion.div>
        </motion.button>
      )}
    </section>
  );
}
