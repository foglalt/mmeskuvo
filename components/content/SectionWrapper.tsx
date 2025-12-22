"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function SectionWrapper({
  id,
  children,
  className,
  animate = true,
}: SectionWrapperProps) {
  const content = (
    <div className="mx-auto max-w-4xl px-4 md:px-8">
      {children}
    </div>
  );

  if (!animate) {
    return (
      <section
        id={id}
        className={cn("min-h-screen py-16 scroll-mt-16", className)}
      >
        {content}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("min-h-screen py-16 scroll-mt-16", className)}
    >
      {content}
    </motion.section>
  );
}
