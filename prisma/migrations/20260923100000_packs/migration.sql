-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN "packId" INTEGER;

-- CreateTable
CREATE TABLE "Pack" (
    "id" SERIAL NOT NULL,
    "topicId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "stripePriceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPack" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "packId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Quiz_packId_idx" ON "Quiz"("packId");

-- CreateIndex
CREATE INDEX "Pack_topicId_idx" ON "Pack"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "Pack_stripePriceId_key" ON "Pack"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPack_userId_packId_key" ON "UserPack"("userId", "packId");

-- CreateIndex
CREATE INDEX "UserPack_packId_idx" ON "UserPack"("packId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pack" ADD CONSTRAINT "Pack_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPack" ADD CONSTRAINT "UserPack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPack" ADD CONSTRAINT "UserPack_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
