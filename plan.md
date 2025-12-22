# Wedding Website - Architecture Plan

> **Project:** Personal Wedding Website  
> **Created:** December 22, 2025  
> **Status:** Planning Phase

---

## 1. Project Overview

A simple, elegant wedding website with:
- **Public view**: Mobile-first, single-page scrollable site for guests
- **Admin view**: Desktop-first dashboard with live preview for content editing
- **Languages**: Hungarian (default) + English

---

## 2. Tech Stack

| Component | Technology | Reason |
|-----------|------------|--------|
| **Framework** | Next.js 14 (App Router) | Modern React, SSR, API routes |
| **Language** | TypeScript | Type safety, better DX |
| **Database** | NeonDB (PostgreSQL) | Free Vercel integration |
| **ORM** | Prisma | Type-safe database queries |
| **Hosting** | Vercel | Free tier, seamless Next.js integration |
| **Styling** | Tailwind CSS | Utility-first, responsive, fast |
| **Images** | `/public` folder + `next/image` | Simple, ~10 images max, built-in optimization |
| **Icons** | Lucide React | Lightweight, tree-shakeable |

---

## 3. Technical Requirements & Best Practices

### 3.1 React Paradigms

- **React Server Components (RSC)**: Use by default, client components only when needed
- **Server Actions**: For form submissions and mutations where appropriate
- **Suspense & Streaming**: For loading states
- **`use client`**: Only for interactive components (forms, editors, state)

### 3.2 Component Design Principles

- **Single Responsibility Principle (SRP)**: Each component does ONE thing
- **Composition over Inheritance**: Build complex UIs from simple primitives
- **Reusability**: UI primitives shared between public and admin views
- **Colocation**: Keep related files together (component + types + styles)

### 3.3 Code Style

```typescript
// ✅ DO: Named exports, explicit types
export function Button({ children, variant = "primary" }: ButtonProps) {
  return <button className={variants[variant]}>{children}</button>;
}

// ❌ DON'T: Default exports, implicit any
export default function(props) { ... }
```

### 3.4 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Button.tsx`, `HeroSection.tsx` |
| Utilities | camelCase | `formatDate.ts`, `cn.ts` |
| Hooks | camelCase with `use` prefix | `useContent.ts` |
| Types | PascalCase | `Content.ts` |
| API Routes | lowercase | `route.ts` |

### 3.5 State Management

- **Server State**: Fetch in Server Components, pass as props
- **Client State**: React `useState` / `useReducer` for local UI state
- **Form State**: React Hook Form (if needed) or native form handling
- **No Redux**: Overkill for this project

### 3.6 Styling Guidelines

- **Tailwind CSS**: Primary styling method
- **CSS Variables**: For theme colors (allows runtime changes)
- **`cn()` utility**: For conditional class merging (clsx + tailwind-merge)
- **Mobile-first**: Start with mobile styles, add `md:` / `lg:` for larger screens

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 3.7 Performance

- **Image Optimization**: Use `next/image` with Cloudinary loader
- **Font Optimization**: Use `next/font` for Google Fonts
- **Code Splitting**: Automatic with App Router
- **ISR/Caching**: Cache database queries, revalidate on admin save

### 3.8 Security

- **Admin Auth**: Environment variable password (simple) or NextAuth (if needed)
- **API Validation**: Zod schemas for all inputs
- **CSRF**: Built-in with Server Actions
- **Environment Variables**: Never expose secrets to client

---

## 4. Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Main site content - single row
model SiteContent {
  id        String   @id @default("main")
  
  // Theme settings
  theme     Json     // { primary, secondary, accent, font }
  
  // Section content
  hero      Json     // { invitationImage, showScrollHint }
  info      Json     // { content, subsections: [{ title, content }] }
  support   Json     // { intro, options: [{ title, desc, link }], volunteerOptions: [] }
  about     Json     // { story, images: [{ src, caption }] }
  
  updatedAt DateTime @updatedAt
}

// Translations
model Translation {
  id        String   @id // "hu" or "en"
  content   Json     // All UI strings
  updatedAt DateTime @updatedAt
}

// RSVP submissions from guests
model RsvpSubmission {
  id                 String   @id @default(cuid())
  
  // Guest info
  guestName          String
  additionalGuests   String[] // Array of names
  phone              String?
  
  // Needs
  needsAccommodation Boolean  @default(false)
  needsTransport     Boolean  @default(false)
  
  // Support options
  volunteerOptions   String[] // Selected volunteer options
  comments           String?  // Additional comments
  
  // Metadata
  language           String   @default("hu") // Language used when submitting
  createdAt          DateTime @default(now())
}
```

---

## 5. File Structure

```
mmeskuvo/
├── app/
│   ├── (public)/                    # Public routes (no /public in URL)
│   │   ├── layout.tsx               # Public layout with navbar
│   │   └── page.tsx                 # Main scrollable page
│   │
│   ├── (admin)/                     # Admin routes
│   │   └── admin/
│   │       ├── layout.tsx           # Admin layout with sidebar + auth
│   │       ├── page.tsx             # Dashboard overview
│   │       ├── hero/page.tsx        # Edit hero section
│   │       ├── info/page.tsx        # Edit info section
│   │       ├── support/page.tsx     # Edit support section
│   │       ├── about/page.tsx       # Edit about section
│   │       ├── theme/page.tsx       # Edit colors & fonts
│   │       ├── translations/page.tsx # Edit translations
│   │       └── rsvp/page.tsx        # View RSVP submissions
│   │
│   ├── api/
│   │   ├── content/route.ts         # GET/PUT site content
│   │   ├── rsvp/route.ts            # POST submission, GET all
│   │   ├── translations/route.ts    # GET/PUT translations
│   │   └── upload/route.ts          # Image upload to Cloudinary
│   │
│   ├── layout.tsx                   # Root layout
│   ├── globals.css                  # Global styles + Tailwind
│   └── providers.tsx                # Client providers (theme, language)
│
├── components/
│   ├── ui/                          # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── Checkbox.tsx
│   │   └── index.ts                 # Barrel export
│   │
│   ├── content/                     # Content display components
│   │   ├── MarkdownRenderer.tsx     # Renders markdown to styled HTML
│   │   ├── ImageGallery.tsx         # Gallery with lightbox
│   │   └── SectionWrapper.tsx       # Consistent section container
│   │
│   ├── sections/                    # Page sections (public + admin preview)
│   │   ├── HeroSection.tsx
│   │   ├── InfoSection.tsx
│   │   ├── RsvpSection.tsx
│   │   ├── SupportSection.tsx
│   │   └── AboutSection.tsx
│   │
│   ├── admin/                       # Admin-specific components
│   │   ├── EditorWithPreview.tsx    # Split view editor
│   │   ├── MarkdownEditor.tsx       # Markdown textarea with toolbar
│   │   ├── ImageUploader.tsx        # Cloudinary upload widget
│   │   ├── SubsectionEditor.tsx     # Edit info subsections
│   │   └── RsvpTable.tsx            # Display submissions
│   │
│   ├── layout/                      # Layout components
│   │   ├── Navbar.tsx               # Public navigation
│   │   ├── AdminSidebar.tsx         # Admin navigation
│   │   ├── Footer.tsx
│   │   └── LanguageToggle.tsx
│   │
│   └── forms/                       # Form components
│       ├── RsvpForm.tsx             # Guest RSVP form
│       └── AdminLoginForm.tsx       # Simple password form
│
├── lib/
│   ├── db.ts                        # Prisma client singleton
│   ├── auth.ts                      # Password verification
│   ├── utils.ts                     # cn(), formatDate(), etc.
│   └── validations.ts               # Zod schemas
│
├── hooks/
│   ├── useContent.ts                # Fetch/update content
│   ├── useLanguage.ts               # Language switching
│   └── useTheme.ts                  # Dynamic theme colors
│
├── types/
│   ├── content.ts                   # Content type definitions
│   └── rsvp.ts                      # RSVP type definitions
│
├── prisma/
│   └── schema.prisma                # Database schema
│
├── public/
│   └── images/                      # Static images (fallbacks)
│
├── .env.local                       # Environment variables (not committed)
├── .env.example                     # Example env file
├── tailwind.config.ts               # Tailwind configuration
├── next.config.js                   # Next.js configuration
├── package.json
├── tsconfig.json
├── plan.md                          # This file
└── requirements.md                  # Original requirements
```

---

## 6. Component Architecture

### 6.1 Component Hierarchy

```
App
├── Providers (theme, language)
│
├── PublicLayout
│   ├── Navbar
│   │   └── LanguageToggle
│   ├── Main (scrollable)
│   │   ├── HeroSection
│   │   │   └── SectionWrapper
│   │   ├── InfoSection
│   │   │   ├── SectionWrapper
│   │   │   └── MarkdownRenderer
│   │   ├── RsvpSection
│   │   │   ├── SectionWrapper
│   │   │   └── RsvpForm
│   │   ├── SupportSection
│   │   │   ├── SectionWrapper
│   │   │   └── MarkdownRenderer
│   │   └── AboutSection
│   │       ├── SectionWrapper
│   │       ├── MarkdownRenderer
│   │       └── ImageGallery
│   └── Footer
│
└── AdminLayout
    ├── AdminSidebar
    └── EditorWithPreview
        ├── [Editor Form]
        └── [Section Preview] (same components as public)
```

### 6.2 Shared Components Pattern

```tsx
// The same InfoSection component is used in:
// 1. Public page (/page.tsx)
// 2. Admin preview (/admin/info/page.tsx)

// components/sections/InfoSection.tsx
interface InfoSectionProps {
  content: string;
  subsections: Array<{ title: string; content: string }>;
}

export function InfoSection({ content, subsections }: InfoSectionProps) {
  return (
    <SectionWrapper id="info">
      <MarkdownRenderer content={content} />
      {subsections.map((sub, i) => (
        <div key={i} className="mt-8">
          <h3 className="font-serif text-xl">{sub.title}</h3>
          <MarkdownRenderer content={sub.content} />
        </div>
      ))}
    </SectionWrapper>
  );
}
```

---

## 7. Data Flow

### 7.1 Public Site (Read)

```
┌─────────────┐     Server Component      ┌─────────────┐
│   Browser   │ ◄─────────────────────── │   NeonDB    │
│  (Guest)    │     (fetch at build/     │             │
└─────────────┘      request time)        └─────────────┘

Images: Served from /public folder, optimized by next/image
```

### 7.2 Admin Edit (Write)

```
┌─────────────┐    POST /api/content     ┌─────────────┐
│   Admin     │ ──────────────────────► │   NeonDB    │
│   Browser   │                          │             │
└─────────────┘                          └─────────────┘
      │
      │  revalidatePath("/")
      ▼
┌─────────────┐
│ Public page │
│  refreshed  │
└─────────────┘
```

### 7.3 RSVP Submission

```
┌─────────────┐    POST /api/rsvp        ┌─────────────┐
│   Guest     │ ──────────────────────► │   NeonDB    │
│   Browser   │                          │             │
└─────────────┘                          └─────────────┘
                                               │
                                               ▼
                                    ┌─────────────────┐
                                    │ Admin views in  │
                                    │ /admin/rsvp     │
                                    └─────────────────┘
```

---

## 8. API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/content` | Get all site content | No |
| PUT | `/api/content` | Update site content | Yes |
| GET | `/api/translations` | Get translations | No |
| PUT | `/api/translations` | Update translations | Yes |
| POST | `/api/rsvp` | Submit RSVP | No |
| GET | `/api/rsvp` | Get all RSVPs | Yes |
| DELETE | `/api/rsvp/[id]` | Delete RSVP | Yes |
| GET | `/api/images` | List available images in /public | Yes |

---

## 9. Feature Breakdown & Time Estimates

| Phase | Feature | Est. Time |
|-------|---------|-----------|
| **Setup** | | |
| | Next.js + TypeScript setup | 30 min |
| | Tailwind + fonts configuration | 30 min |
| | Prisma + NeonDB setup | 1 hour |
| | Project structure creation | 30 min |
| **UI Primitives** | | |
| | Button, Input, Textarea | 1 hour |
| | Card, Modal, Checkbox | 1 hour |
| | ColorPicker, LanguageToggle | 1 hour |
| **Content Components** | | |
| | MarkdownRenderer | 1 hour |
| | ImageGallery | 1.5 hours |
| | SectionWrapper | 30 min |
| **Page Sections** | | |
| | HeroSection | 1 hour |
| | InfoSection | 1.5 hours |
| | RsvpSection + form | 2 hours |
| | SupportSection | 1.5 hours |
| | AboutSection | 1.5 hours |
| **Layout** | | |
| | Navbar + smooth scroll | 1 hour |
| | Footer | 30 min |
| | AdminSidebar | 1 hour |
| **Admin** | | |
| | Auth middleware | 1 hour |
| | EditorWithPreview | 1.5 hours |
| | Hero editor | 1 hour |
| | Info editor | 1.5 hours |
| | Support editor | 1 hour |
| | About editor | 1 hour |
| | Theme editor | 1 hour |
| | RSVP viewer | 1.5 hours |
| **API** | | |
| | Content endpoints | 1 hour |
| | RSVP endpoints | 1 hour |
| | Image selector (list /public) | 30 min |
| **Extras** | | |
| | Language toggle + context | 1.5 hours |
| | Animations/transitions | 1.5 hours |
| | Testing & polish | 2 hours |
| | | |
| **TOTAL** | | **~30-35 hours** |

---

## 10. Environment Variables

```bash
# .env.local

# Database (from Vercel NeonDB integration)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Admin auth
ADMIN_PASSWORD="your-secure-password"

# Optional: Site URL for metadata
NEXT_PUBLIC_SITE_URL="https://your-wedding-site.vercel.app"
```

---

## 11. Deployment Checklist

- [ ] Create Vercel project
- [ ] Add NeonDB integration
- [ ] Set environment variables
- [ ] Push to GitHub (auto-deploy)
- [ ] Run `prisma db push` (via Vercel build)
- [ ] Seed initial content
- [ ] Configure custom domain (optional)

---

## 12. Future Enhancements (Out of Scope)

These features are NOT planned but could be added later:

- [ ] Email notifications for new RSVPs
- [ ] Photo upload from guests
- [ ] Countdown timer
- [ ] Google Maps embed for venue
- [ ] Background music
- [ ] Guest book / comments section

---

## 13. Decisions Made

| Question | Decision |
|----------|----------|
| **Fonts** | Editable via admin. Preload a few elegant options (Playfair Display, Cormorant Garamond, Great Vibes, Lora) |
| **Animations** | Framer Motion - but keep effects subtle and simple |
| **Image lightbox** | Simple custom modal with `next/image` |
| **Admin mobile** | Desktop-only admin is acceptable |
| **Public site** | Mobile-first, responsive (should look decent on desktop too) |

---

## 14. Dependencies

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "@prisma/client": "^5.x",
    "framer-motion": "^10.x",
    "react-markdown": "^9.x",
    "lucide-react": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "prisma": "^5.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "@types/node": "^20.x",
    "@types/react": "^18.x"
  }
}
```

---

*This document will be updated as development progresses.*
