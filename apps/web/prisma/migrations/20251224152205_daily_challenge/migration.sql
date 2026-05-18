-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_gameId_fkey";

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_userId_fkey";

-- CreateTable
CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameId" TEXT NOT NULL,

    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyChallengeScore" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "playerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "DailyChallengeScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyChallenge_gameId_day_idx" ON "DailyChallenge"("gameId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallenge_day_gameId_key" ON "DailyChallenge"("day", "gameId");

-- CreateIndex
CREATE INDEX "DailyChallengeScore_challengeId_value_idx" ON "DailyChallengeScore"("challengeId", "value");

-- CreateIndex
CREATE INDEX "DailyChallengeScore_createdAt_idx" ON "DailyChallengeScore"("createdAt");

-- CreateIndex
CREATE INDEX "DailyChallengeScore_userId_createdAt_idx" ON "DailyChallengeScore"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyChallenge" ADD CONSTRAINT "DailyChallenge_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyChallengeScore" ADD CONSTRAINT "DailyChallengeScore_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "DailyChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyChallengeScore" ADD CONSTRAINT "DailyChallengeScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
