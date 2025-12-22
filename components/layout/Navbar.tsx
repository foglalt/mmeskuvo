"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";

interface NavbarProps {
  items: Array<{ href: string; label: string }>;
  language: "hu" | "en";
  onLanguageChange: (lang: "hu" | "en") => void;
}

export function Navbar({ items, language, onLanguageChange }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    // Smooth scroll to section
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home link */}
          <button
            onClick={() => handleNavClick("#hero")}
            className="font-serif text-xl text-primary hover:text-accent transition-colors"
          >
            M & M
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            {items.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
            <LanguageToggle
              language={language}
              onChange={onLanguageChange}
            />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-4 space-y-3">
              {items.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="block w-full text-left text-gray-600 hover:text-primary py-2 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <LanguageToggle
                  language={language}
                  onChange={onLanguageChange}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
