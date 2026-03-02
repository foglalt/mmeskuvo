-- AlterTable
ALTER TABLE "RsvpSubmission"
ADD COLUMN "accommodationResolved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "transportResolved" BOOLEAN NOT NULL DEFAULT false;
