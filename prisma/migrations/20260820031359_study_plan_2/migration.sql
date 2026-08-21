/*
  Warnings:

  - You are about to drop the column `studyPlanCity` on the `StudyPlan` table. All the data in the column will be lost.
  - You are about to drop the column `studyPlanCommunity` on the `StudyPlan` table. All the data in the column will be lost.
  - You are about to drop the column `studyPlanType` on the `StudyPlan` table. All the data in the column will be lost.
  - Added the required column `city` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `community` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "StudyPlan_studyPlanCommunity_studyPlanCity_studyPlanType_idx";

-- AlterTable
ALTER TABLE "StudyPlan" DROP COLUMN "studyPlanCity",
DROP COLUMN "studyPlanCommunity",
DROP COLUMN "studyPlanType",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "community" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "StudyPlan_community_city_type_idx" ON "StudyPlan"("community", "city", "type");
