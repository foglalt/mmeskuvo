-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "theme" JSONB NOT NULL,
    "hero" JSONB NOT NULL,
    "info" JSONB NOT NULL,
    "support" JSONB NOT NULL,
    "about" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RsvpSubmission" (
    "id" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "additionalGuests" TEXT[],
    "phone" TEXT,
    "needsAccommodation" BOOLEAN NOT NULL DEFAULT false,
    "needsTransport" BOOLEAN NOT NULL DEFAULT false,
    "volunteerOptions" TEXT[],
    "comments" TEXT,
    "language" TEXT NOT NULL DEFAULT 'hu',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RsvpSubmission_pkey" PRIMARY KEY ("id")
);
