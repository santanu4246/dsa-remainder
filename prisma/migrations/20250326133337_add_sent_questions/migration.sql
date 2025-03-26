-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email_verified" TIMESTAMP(3),
ALTER COLUMN "difficulty" SET DEFAULT 'EASY';

-- CreateTable
CREATE TABLE "SentQuestion" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "questionLink" TEXT NOT NULL,
    "titleSlug" TEXT NOT NULL,
    "readableTitle" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SentQuestion_userId_idx" ON "SentQuestion"("userId");

-- AddForeignKey
ALTER TABLE "SentQuestion" ADD CONSTRAINT "SentQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
