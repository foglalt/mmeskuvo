import { z } from "zod";

// Reusable schemas
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex color");

// Theme configuration
export const themeSchema = z.object({
  primary: hexColor,
  secondary: hexColor,
  accent: hexColor,
  fontHeading: z.string().min(1, "Font is required"),
  fontBody: z.string().min(1, "Font is required"),
});

// Hero section
export const heroSchema = z.object({
  invitationImage: z.string().min(1, "Image is required"),
  showScrollHint: z.boolean(),
});

// Info section
export const infoSubsectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string(),
});

export const infoSchema = z.object({
  mainText: z.string(),
  subsections: z.array(infoSubsectionSchema),
});

// Support section
export const supportOptionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  link: z.string().url().optional().or(z.literal("")),
});

export const supportSchema = z.object({
  intro: z.string(),
  options: z.array(supportOptionSchema),
  volunteerOptions: z.array(z.string()),
});

// About section
export const galleryImageSchema = z.object({
  src: z.string().min(1, "Image source is required"),
  caption: z.string().optional(),
});

export const aboutSchema = z.object({
  story: z.string(),
  images: z.array(galleryImageSchema),
});

// Complete site content (partial updates allowed)
export const siteContentSchema = z.object({
  theme: themeSchema.optional(),
  hero: heroSchema.optional(),
  info: infoSchema.optional(),
  support: supportSchema.optional(),
  about: aboutSchema.optional(),
});

// RSVP submission
export const rsvpSubmissionSchema = z.object({
  guestName: z.string().min(2, "A név legalább 2 karakter legyen"),
  additionalGuests: z.array(z.string()).default([]),
  phone: z.string().optional(),
  needsAccommodation: z.boolean().default(false),
  needsTransport: z.boolean().default(false),
  volunteerOptions: z.array(z.string()).default([]),
  comments: z.string().optional(),
  language: z.enum(["hu", "en"]).default("hu"),
});

// Translations
export const translationsSchema = z.object({
  hu: z.record(z.string(), z.string()),
  en: z.record(z.string(), z.string()),
});

// Type exports
export type ThemeConfig = z.infer<typeof themeSchema>;
export type HeroContent = z.infer<typeof heroSchema>;
export type InfoSubsection = z.infer<typeof infoSubsectionSchema>;
export type InfoContent = z.infer<typeof infoSchema>;
export type SupportOption = z.infer<typeof supportOptionSchema>;
export type SupportContent = z.infer<typeof supportSchema>;
export type GalleryImage = z.infer<typeof galleryImageSchema>;
export type AboutContent = z.infer<typeof aboutSchema>;
export type SiteContentInput = z.infer<typeof siteContentSchema>;
export type RsvpSubmissionInput = z.infer<typeof rsvpSubmissionSchema>;
export type TranslationsInput = z.infer<typeof translationsSchema>;

