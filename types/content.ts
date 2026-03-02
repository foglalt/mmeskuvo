export type LanguageCode = "hu" | "en";

export interface LocalizedText {
  hu: string;
  en: string;
}

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
  title: LocalizedText;
  content: LocalizedText;  // Markdown
}

export interface InfoContent {
  mainText: LocalizedText;  // Markdown
  subsections: InfoSubsection[];
}

// Support section
export interface SupportOption {
  title: LocalizedText;
  description: LocalizedText;  // Markdown
  link?: string;
}

export interface SupportContent {
  intro: LocalizedText;  // Markdown
  options: SupportOption[];
  volunteerOptions: LocalizedText[];  // Checkbox labels
}

// About section
export interface GalleryImage {
  src: string;      // Path in /public/images/
  caption?: LocalizedText;
}

export interface AboutContent {
  story: LocalizedText;  // Markdown
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
  accommodationResolved: boolean;
  transportResolved: boolean;
  volunteerResolved: boolean;
  volunteerTransportResolved: boolean;
  volunteerOptions: string[];
  comments?: string;
  adminComment?: string;
  language: LanguageCode;
  createdAt: Date;
}

// API response types
export interface ApiError {
  error: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  data: T;
}
