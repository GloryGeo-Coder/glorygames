-- CreateTable
CREATE TABLE "DailyScore" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyScore_day_gameId_score_idx" ON "DailyScore"("day", "gameId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "DailyScore_day_gameId_playerName_key" ON "DailyScore"("day", "gameId", "playerName");

-- AddForeignKey
ALTER TABLE "DailyScore" ADD CONSTRAINT "DailyScore_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
