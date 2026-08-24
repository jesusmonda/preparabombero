-- AlterTable
ALTER TABLE "StudyPlanTopic" ADD COLUMN "topicName" TEXT;

-- Backfill existing study-plan topics before making the column required.
UPDATE "StudyPlanTopic" AS study_plan_topic
SET "topicName" = topic.title
FROM "Topic" AS topic
WHERE topic.id = study_plan_topic."topicId";

-- AlterTable
ALTER TABLE "StudyPlanTopic" ALTER COLUMN "topicName" SET NOT NULL;
