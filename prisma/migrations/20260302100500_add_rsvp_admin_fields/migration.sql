-- AlterTable
ALTER TABLE "RsvpSubmission"
ADD COLUMN "volunteerResolved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "adminComment" TEXT;
