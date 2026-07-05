-- CreateTable
CREATE TABLE "GameAdvice" (
    "id" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "advice" TEXT NOT NULL,
    "chosenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameAdvice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameAdvice_chosenAt_createdAt_idx" ON "GameAdvice"("chosenAt", "createdAt");
