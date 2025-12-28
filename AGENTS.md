# Agent Implementation Guide

> **Purpose:** Detailed implementation guide for coding agents working on this project.  
> **Read first:** [plan.md](plan.md) for architecture overview.

---

## Project Notes (Updated)

- Translations are stored in NeonDB (Translation table) and edited in `/admin/translations`.
- JSON defaults in `content/translations` are used for seeding/fallback.
- Language prompt is dismissable and shows only when device language is not Hungarian.
- Images are pre-uploaded to `public/images` and selected via `/api/images`.

---

## 1. File Creation Order

Create files in this order to satisfy dependencies:

```
Phase 1: Foundation
├── 1. next.config.js
├── 2. tailwind.config.ts
├── 3. app/globals.css
├── 4. lib/utils.ts (cn helper)
├── 5. types/content.ts
└── 6. prisma/schema.prisma

Phase 2: UI Primitives
├── 7. components/ui/Button.tsx
├── 8. components/ui/Input.tsx
├── 9. components/ui/Textarea.tsx
├── 10. components/ui/Card.tsx
├── 11. components/ui/Checkbox.tsx
├── 12. components/ui/Modal.tsx
└── 13. components/ui/index.ts (barrel export)

Phase 3: Content Components
├── 14. components/content/SectionWrapper.tsx
├── 15. components/content/MarkdownRenderer.tsx
└── 16. components/content/ImageGallery.tsx

Phase 4: Database & API
├── 17. lib/db.ts (Prisma client)
├── 18. lib/validations.ts (Zod schemas)
├── 19. lib/auth.ts
├── 20. app/api/content/route.ts
├── 21. app/api/rsvp/route.ts
└── 22. app/api/images/route.ts

Phase 5: Sections
├── 23. components/sections/HeroSection.tsx
├── 24. components/sections/InfoSection.tsx
├── 25. components/sections/RsvpSection.tsx
├── 26. components/sections/SupportSection.tsx
└── 27. components/sections/AboutSection.tsx

Phase 6: Forms
├── 28. components/forms/RsvpForm.tsx
└── 29. components/forms/AdminLoginForm.tsx

Phase 7: Layout
├── 30. components/layout/Navbar.tsx
├── 31. components/layout/Footer.tsx
├── 32. components/layout/AdminSidebar.tsx
└── 33. components/layout/LanguageToggle.tsx

Phase 8: Hooks & Providers
├── 34. hooks/useLanguage.ts
├── 35. hooks/useTheme.ts
├── 36. app/providers.tsx
└── 37. content/translations/hu.json, en.json

Phase 9: Admin Components
├── 38. components/admin/EditorWithPreview.tsx
├── 39. components/admin/MarkdownEditor.tsx
├── 40. components/admin/ImageSelector.tsx
└── 41. components/admin/SubsectionEditor.tsx

Phase 10: Pages
├── 42. app/(public)/layout.tsx
├── 43. app/(public)/page.tsx
├── 44. app/(admin)/admin/layout.tsx
├── 45. app/(admin)/admin/page.tsx
└── 46. app/(admin)/admin/[section]/page.tsx (dynamic route for each section)

Phase 11: Polish
├── 47. Animations with Framer Motion
├── 48. Error boundaries
└── 49. Loading states
```

---

## 2. Code Patterns

### 2.1 Component Template

```tsx
// components/ui/Button.tsx
"use client"; // Only if component uses hooks, events, or browser APIs

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// 1. Define props interface (always export)
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

// 2. Define variants as const object
const variants = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "bg-secondary text-primary hover:bg-secondary/90",
  ghost: "bg-transparent hover:bg-gray-100",
} as const;

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
} as const;

// 3. Use forwardRef for DOM elements
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "disabled:pointer-events-none disabled:opacity-50",
          // Variant & size
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

### 2.2 Section Component Template

```tsx
// components/sections/InfoSection.tsx
import { SectionWrapper } from "@/components/content/SectionWrapper";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import type { InfoContent } from "@/types/content";

// Props match the JSON structure from database
interface InfoSectionProps {
  content: InfoContent;
}

export function InfoSection({ content }: InfoSectionProps) {
  return (
    <SectionWrapper id="info" className="bg-secondary/30">
      <MarkdownRenderer content={content.mainText} />
      
      {content.subsections?.map((subsection, index) => (
        <div key={index} className="mt-12">
          <h3 className="font-serif text-2xl mb-4">{subsection.title}</h3>
          <MarkdownRenderer content={subsection.content} />
        </div>
      ))}
    </SectionWrapper>
  );
}
```

### 2.3 API Route Template

```tsx
// app/api/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { siteContentSchema } from "@/lib/validations";
import { verifyAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// GET - Public, no auth needed
export async function GET() {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { id: "main" },
    });
    
    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(content);
  } catch (error) {
    console.error("Failed to fetch content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Protected, auth required
export async function PUT(request: NextRequest) {
  try {
    // 1. Verify auth
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // 2. Parse and validate body
    const body = await request.json();
    const validated = siteContentSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }
    
    // 3. Update database
    const updated = await prisma.siteContent.upsert({
      where: { id: "main" },
      update: validated.data,
      create: { id: "main", ...validated.data },
    });
    
    // 4. Revalidate public pages
    revalidatePath("/");
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 2.4 Hook Template

```tsx
// hooks/useLanguage.ts
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Language = "hu" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ 
  children,
  translations,
}: { 
  children: ReactNode;
  translations: Record<Language, Record<string, string>>;
}) {
  const [language, setLanguage] = useState<Language>("hu");
  
  const t = useCallback(
    (key: string): string => {
      return translations[language]?.[key] ?? key;
    },
    [language, translations]
  );
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
```

### 2.5 Admin Editor Pattern

```tsx
// app/(admin)/admin/info/page.tsx
"use client";

import { useState, useEffect } from "react";
import { EditorWithPreview } from "@/components/admin/EditorWithPreview";
import { InfoSection } from "@/components/sections/InfoSection";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { SubsectionEditor } from "@/components/admin/SubsectionEditor";
import { Button } from "@/components/ui";
import type { InfoContent } from "@/types/content";

export default function EditInfoPage() {
  const [content, setContent] = useState<InfoContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch current content
  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => setContent(data.info));
  }, []);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ info: content }),
      });
      // Show success toast
    } catch (error) {
      // Show error toast
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!content) return <div>Loading...</div>;
  
  return (
    <EditorWithPreview
      title="Edit Info Section"
      preview={<InfoSection content={content} />}
      onSave={handleSave}
      isSaving={isSaving}
    >
      {/* Editor form */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Main Content</label>
          <MarkdownEditor
            value={content.mainText}
            onChange={(value) => setContent({ ...content, mainText: value })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Subsections</label>
          <SubsectionEditor
            subsections={content.subsections}
            onChange={(subsections) => setContent({ ...content, subsections })}
          />
        </div>
      </div>
    </EditorWithPreview>
  );
}
```

---

## 3. Type Definitions

```typescript
// types/content.ts

// Theme configuration
export interface ThemeConfig {
  primary: string;      // Hex color, e.g., "#d4a574"
  secondary: string;    // Hex color
  accent: string;       // Hex color
  fontHeading: string;  // Google Font name, e.g., "Playfair Display"
  fontBody: string;     // Google Font name, e.g., "Lora"
}

// Hero section
export interface HeroContent {
  invitationImage: string;  // Path in /public/images/
  showScrollHint: boolean;
}

// Info section
export interface InfoSubsection {
  title: string;
  content: string;  // Markdown
}

export interface InfoContent {
  mainText: string;  // Markdown
  subsections: InfoSubsection[];
}

// Support section
export interface SupportOption {
  title: string;
  description: string;  // Markdown
  link?: string;
}

export interface SupportContent {
  intro: string;  // Markdown
  options: SupportOption[];
  volunteerOptions: string[];  // Checkbox labels
}

// About section
export interface GalleryImage {
  src: string;      // Path in /public/images/
  caption?: string;
}

export interface AboutContent {
  story: string;  // Markdown
  images: GalleryImage[];
}

// Complete site content
export interface SiteContent {
  id: string;
  theme: ThemeConfig;
  hero: HeroContent;
  info: InfoContent;
  support: SupportContent;
  about: AboutContent;
  updatedAt: Date;
}

// RSVP submission
export interface RsvpSubmission {
  id: string;
  guestName: string;
  additionalGuests: string[];
  phone?: string;
  needsAccommodation: boolean;
  needsTransport: boolean;
  volunteerOptions: string[];
  comments?: string;
  language: "hu" | "en";
  createdAt: Date;
}

// Translation structure
export interface Translations {
  // Navigation
  "nav.home": string;
  "nav.info": string;
  "nav.rsvp": string;
  "nav.support": string;
  "nav.about": string;
  
  // RSVP form
  "rsvp.title": string;
  "rsvp.name": string;
  "rsvp.name.placeholder": string;
  "rsvp.additionalGuests": string;
  "rsvp.addGuest": string;
  "rsvp.phone": string;
  "rsvp.accommodation": string;
  "rsvp.transport": string;
  "rsvp.comments": string;
  "rsvp.submit": string;
  "rsvp.success": string;
  "rsvp.error": string;
  
  // General
  "language.toggle": string;
  "scrollDown": string;
}
```

---

## 4. Zod Validation Schemas

```typescript
// lib/validations.ts
import { z } from "zod";

// Reusable schemas
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex color");

// Theme
export const themeSchema = z.object({
  primary: hexColor,
  secondary: hexColor,
  accent: hexColor,
  fontHeading: z.string().min(1),
  fontBody: z.string().min(1),
});

// Hero
export const heroSchema = z.object({
  invitationImage: z.string().min(1),
  showScrollHint: z.boolean(),
});

// Info
export const infoSubsectionSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
});

export const infoSchema = z.object({
  mainText: z.string(),
  subsections: z.array(infoSubsectionSchema),
});

// Support
export const supportOptionSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  link: z.string().url().optional().or(z.literal("")),
});

export const supportSchema = z.object({
  intro: z.string(),
  options: z.array(supportOptionSchema),
  volunteerOptions: z.array(z.string()),
});

// About
export const galleryImageSchema = z.object({
  src: z.string().min(1),
  caption: z.string().optional(),
});

export const aboutSchema = z.object({
  story: z.string(),
  images: z.array(galleryImageSchema),
});

// Complete site content
export const siteContentSchema = z.object({
  theme: themeSchema.optional(),
  hero: heroSchema.optional(),
  info: infoSchema.optional(),
  support: supportSchema.optional(),
  about: aboutSchema.optional(),
});

// RSVP submission
export const rsvpSubmissionSchema = z.object({
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  additionalGuests: z.array(z.string()).default([]),
  phone: z.string().optional(),
  needsAccommodation: z.boolean().default(false),
  needsTransport: z.boolean().default(false),
  volunteerOptions: z.array(z.string()).default([]),
  comments: z.string().optional(),
  language: z.enum(["hu", "en"]).default("hu"),
});

export type RsvpSubmissionInput = z.infer<typeof rsvpSubmissionSchema>;
```

---

## 5. CSS & Styling Conventions

### 5.1 Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CSS variables for dynamic theming
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
      },
      fontFamily: {
        serif: ["var(--font-heading)", "serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### 5.2 Global CSS Variables

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Default theme - overridden by JS */
  --color-primary: #d4a574;
  --color-secondary: #f5f0e8;
  --color-accent: #8b7355;
  
  /* Fonts - set by next/font */
  --font-heading: "Playfair Display", serif;
  --font-body: "Lora", sans-serif;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom prose styles for markdown */
@layer components {
  .prose-wedding {
    @apply prose prose-lg max-w-none;
    @apply prose-headings:font-serif prose-headings:text-primary;
    @apply prose-p:text-gray-700;
    @apply prose-a:text-accent prose-a:no-underline hover:prose-a:underline;
    @apply prose-strong:text-primary;
  }
}
```

### 5.3 Responsive Breakpoints

```
Mobile first approach:
- Default: Mobile (< 768px)
- md: Tablet (768px+)
- lg: Desktop (1024px+)
- xl: Large desktop (1280px+)

Example:
<div className="px-4 md:px-8 lg:px-16">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">
```

---

## 6. Framer Motion Patterns

### 6.1 Section Reveal Animation

```tsx
// components/content/SectionWrapper.tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionWrapper({ id, children, className }: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "min-h-screen py-16 px-4 scroll-mt-16",
        className
      )}
    >
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </motion.section>
  );
}
```

### 6.2 Staggered Children Animation

```tsx
// For lists, gallery items, etc.
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Usage
<motion.ul variants={container} initial="hidden" animate="show">
  {items.map((item) => (
    <motion.li key={item.id} variants={item}>
      {item.content}
    </motion.li>
  ))}
</motion.ul>
```

---

## 7. Error Handling

### 7.1 API Error Response Format

```typescript
// Always return consistent error shape
interface ApiError {
  error: string;
  details?: unknown;
}

// Success response
return NextResponse.json(data);

// Error response
return NextResponse.json(
  { error: "Human readable message", details: zodError.flatten() },
  { status: 400 }
);
```

### 7.2 Client-Side Error Handling

```tsx
// Use try-catch with user-friendly messages
try {
  const res = await fetch("/api/rsvp", { method: "POST", body: JSON.stringify(data) });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Something went wrong");
  }
  
  // Success handling
} catch (error) {
  // Show toast or inline error
  setError(error instanceof Error ? error.message : "Unexpected error");
}
```

---

## 8. Testing Checklist

Before considering a feature complete:

- [ ] Works on mobile (320px - 768px)
- [ ] Works on tablet (768px - 1024px)
- [ ] Works on desktop (1024px+)
- [ ] Handles loading state
- [ ] Handles error state
- [ ] Handles empty state
- [ ] Form validation works
- [ ] Keyboard navigation works
- [ ] No console errors
- [ ] TypeScript has no errors

---

## 9. Common Pitfalls to Avoid

| ❌ Don't | ✅ Do |
|----------|-------|
| Use `export default` | Use named exports |
| Forget `"use client"` for interactive components | Add directive when using hooks/events |
| Hardcode colors | Use CSS variables via Tailwind |
| Use `any` type | Define proper interfaces |
| Nest ternaries | Use early returns or separate variables |
| Forget loading states | Always show feedback for async operations |
| Use `px` for spacing | Use Tailwind spacing scale |
| Forget mobile styles | Start mobile-first, add `md:` for larger |
| Put business logic in components | Extract to lib/ or hooks/ |
| Forget to validate API inputs | Always use Zod schemas |

---

## 10. Git Commit Convention

```
feat: Add RSVP form component
fix: Correct mobile padding on hero section
style: Update button hover colors
refactor: Extract markdown parsing to lib
docs: Update AGENTS.md with new patterns
chore: Update dependencies
```

---

## 11. Environment Setup Checklist

Before starting development:

1. [ ] Node.js 18+ installed
2. [ ] Run `npm install`
3. [ ] Copy `.env.example` to `.env.local`
4. [ ] Set up NeonDB and add `DATABASE_URL`
5. [ ] Set `ADMIN_PASSWORD`
6. [ ] Run `npx prisma db push`
7. [ ] Run `npm run dev`

---

*This document should be consulted by any agent before writing code.*
