-- DropForeignKey
ALTER TABLE "StudyPlanTopic" DROP CONSTRAINT "StudyPlanTopic_topicId_fkey";

-- DropIndex
DROP INDEX "StudyPlanTopic_studyPlanId_topicId_type_key";

-- AlterTable
ALTER TABLE "StudyPlanTopic"
  ALTER COLUMN "topicId" SET DATA TYPE INTEGER[]
  USING ARRAY["topicId"];
