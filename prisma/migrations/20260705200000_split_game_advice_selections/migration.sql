-- Replace the shared choice with one independent favorite per partner.
-- The previous shared choice is intentionally not migrated, clearing it.

-- DropIndex
DROP INDEX "GameAdvice_chosenAt_createdAt_idx";

-- AlterTable
ALTER TABLE "GameAdvice" DROP COLUMN "chosenAt";

-- CreateEnum
CREATE TYPE "GameAdviceRole" AS ENUM ('BRIDE', 'GROOM');

-- CreateTable
CREATE TABLE "GameAdviceSelection" (
    "role" "GameAdviceRole" NOT NULL,
    "adviceId" TEXT NOT NULL,
    "chosenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameAdviceSelection_pkey" PRIMARY KEY ("role")
);

-- CreateIndex
CREATE INDEX "GameAdvice_createdAt_idx" ON "GameAdvice"("createdAt");

-- CreateIndex
CREATE INDEX "GameAdviceSelection_adviceId_idx" ON "GameAdviceSelection"("adviceId");

-- AddForeignKey
ALTER TABLE "GameAdviceSelection"
ADD CONSTRAINT "GameAdviceSelection_adviceId_fkey"
FOREIGN KEY ("adviceId") REFERENCES "GameAdvice"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
