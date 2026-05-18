-- CreateEnum
CREATE TYPE "GameCategory" AS ENUM ('ARCADE', 'ACTION', 'ADVENTURE', 'EDUCATIONAL', 'PUZZLE', 'RACING', 'WORD_TRIVIA', 'STRATEGY', 'SPORTS', 'SIMULATION', 'DEFENSE', 'PLATFORMER', 'CASUAL', 'MULTIPLAYER', 'KIDS_FAMILY');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "category" "GameCategory" NOT NULL DEFAULT 'ARCADE';

-- CreateIndex
CREATE INDEX "Game_category_title_idx" ON "Game"("category", "title");
