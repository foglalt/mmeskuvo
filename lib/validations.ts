import { z } from "zod";

// Reusable schemas
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex color");
const localizedTextSchema = z
  .union([
    z.string(),
    z.object({
      hu: z.string(),
      en: z.string(),
    }),
  ])
  .transform((value) => {
    if (typeof value === "string") {
      return { hu: value, en: value };
    }

    return {
      hu: value.hu ?? value.en ?? "",
      en: value.en ?? value.hu ?? "",
    };
  });

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
  title: localizedTextSchema,
  content: localizedTextSchema,
});

export const infoSchema = z.object({
  mainText: localizedTextSchema,
  subsections: z.array(infoSubsectionSchema),
});

// Support section
export const supportOptionSchema = z.object({
  title: localizedTextSchema,
  description: localizedTextSchema,
  link: z.string().url().optional().or(z.literal("")),
});

export const supportSchema = z.object({
  intro: localizedTextSchema,
  options: z.array(supportOptionSchema),
  volunteerOptions: z.array(localizedTextSchema),
});

// About section
export const galleryImageSchema = z.object({
  src: z.string().min(1, "Image source is required"),
  caption: localizedTextSchema.optional(),
});

export const aboutSchema = z.object({
  story: localizedTextSchema,
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

export const rsvpResolutionUpdateSchema = z
  .object({
    accommodationResolved: z.boolean().optional(),
    transportResolved: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.accommodationResolved !== undefined ||
      value.transportResolved !== undefined,
    {
      message: "At least one resolution field is required",
    }
  );

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
export type RsvpResolutionUpdateInput = z.infer<typeof rsvpResolutionUpdateSchema>;
export type TranslationsInput = z.infer<typeof translationsSchema>;

