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

// API response types
export interface ApiError {
  error: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  data: T;
}
