/*
  Warnings:

  - You are about to drop the column `topicEspecificoId` on the `StudyPlan` table. All the data in the column will be lost.
  - You are about to drop the column `topicLegislacionId` on the `StudyPlan` table. All the data in the column will be lost.
  - You are about to drop the column `topicTerritorialId` on the `StudyPlan` table. All the data in the column will be lost.
  - You are about to drop the column `studyPlanTopicId` on the `StudyPlanQuiz` table. All the data in the column will be lost.
  - You are about to drop the column `examDate` on the `StudyPlanTopic` table. All the data in the column will be lost.
  - You are about to drop the column `percentage` on the `StudyPlanTopic` table. All the data in the column will be lost.
  - You are about to drop the column `topicEspecificoId` on the `StudyPlanTopic` table. All the data in the column will be lost.
  - You are about to drop the column `topicLegislacionId` on the `StudyPlanTopic` table. All the data in the column will be lost.
  - You are about to drop the column `topicTerritorialId` on the `StudyPlanTopic` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `StudyPlanTopic` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studyPlanExamId,quizId]` on the table `StudyPlanQuiz` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studyPlanId,topicId,type]` on the table `StudyPlanTopic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `studyPlanExamId` to the `StudyPlanQuiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topicId` to the `StudyPlanTopic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `StudyPlanTopic` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StudyPlanTopicType" AS ENUM ('ESPECIFICO', 'LEGISLACION', 'TERRITORIAL');

-- DropForeignKey
ALTER TABLE "StudyPlan" DROP CONSTRAINT "StudyPlan_topicEspecificoId_fkey";

-- DropForeignKey
ALTER TABLE "StudyPlan" DROP CONSTRAINT "StudyPlan_topicLegislacionId_fkey";

-- DropForeignKey
ALTER TABLE "StudyPlan" DROP CONSTRAINT "StudyPlan_topicTerritorialId_fkey";

-- DropForeignKey
ALTER TABLE "StudyPlanQuiz" DROP CONSTRAINT "StudyPlanQuiz_studyPlanTopicId_fkey";

-- DropForeignKey
ALTER TABLE "StudyPlanTopic" DROP CONSTRAINT "StudyPlanTopic_topicEspecificoId_fkey";

-- DropForeignKey
ALTER TABLE "StudyPlanTopic" DROP CONSTRAINT "StudyPlanTopic_topicLegislacionId_fkey";

-- DropForeignKey
ALTER TABLE "StudyPlanTopic" DROP CONSTRAINT "StudyPlanTopic_topicTerritorialId_fkey";

-- DropForeignKey
ALTER TABLE "StudyPlanTopic" DROP CONSTRAINT "StudyPlanTopic_userId_fkey";

-- DropIndex
DROP INDEX "StudyPlanQuiz_studyPlanTopicId_quizId_key";

-- DropIndex
DROP INDEX "StudyPlanTopic_userId_examDate_idx";

-- DropIndex
DROP INDEX "StudyPlanTopic_userId_studyPlanId_topicEspecificoId_topicLe_key";

-- AlterTable
ALTER TABLE "StudyPlan" DROP COLUMN "topicEspecificoId",
DROP COLUMN "topicLegislacionId",
DROP COLUMN "topicTerritorialId";

-- AlterTable
ALTER TABLE "StudyPlanQuiz" DROP COLUMN "studyPlanTopicId",
ADD COLUMN     "studyPlanExamId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StudyPlanTopic" DROP COLUMN "examDate",
DROP COLUMN "percentage",
DROP COLUMN "topicEspecificoId",
DROP COLUMN "topicLegislacionId",
DROP COLUMN "topicTerritorialId",
DROP COLUMN "userId",
ADD COLUMN     "topicId" INTEGER NOT NULL,
ADD COLUMN     "type" "StudyPlanTopicType" NOT NULL;

-- CreateTable
CREATE TABLE "StudyPlanExam" (
    "id" SERIAL NOT NULL,
    "studyPlanId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "topicEspecificoId" INTEGER NOT NULL,
    "topicLegislacionId" INTEGER NOT NULL,
    "topicTerritorialId" INTEGER NOT NULL,
    "examDate" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION,

    CONSTRAINT "StudyPlanExam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyPlanExam_userId_examDate_idx" ON "StudyPlanExam"("userId", "examDate");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlanExam_userId_studyPlanId_topicEspecificoId_topicLeg_key" ON "StudyPlanExam"("userId", "studyPlanId", "topicEspecificoId", "topicLegislacionId", "topicTerritorialId", "examDate");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlanQuiz_studyPlanExamId_quizId_key" ON "StudyPlanQuiz"("studyPlanExamId", "quizId");

-- CreateIndex
CREATE INDEX "StudyPlanTopic_studyPlanId_type_idx" ON "StudyPlanTopic"("studyPlanId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlanTopic_studyPlanId_topicId_type_key" ON "StudyPlanTopic"("studyPlanId", "topicId", "type");

-- AddForeignKey
ALTER TABLE "StudyPlanTopic" ADD CONSTRAINT "StudyPlanTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanExam" ADD CONSTRAINT "StudyPlanExam_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanExam" ADD CONSTRAINT "StudyPlanExam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanExam" ADD CONSTRAINT "StudyPlanExam_topicEspecificoId_fkey" FOREIGN KEY ("topicEspecificoId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanExam" ADD CONSTRAINT "StudyPlanExam_topicLegislacionId_fkey" FOREIGN KEY ("topicLegislacionId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanExam" ADD CONSTRAINT "StudyPlanExam_topicTerritorialId_fkey" FOREIGN KEY ("topicTerritorialId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanQuiz" ADD CONSTRAINT "StudyPlanQuiz_studyPlanExamId_fkey" FOREIGN KEY ("studyPlanExamId") REFERENCES "StudyPlanExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
