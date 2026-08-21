-- CreateEnum
CREATE TYPE "StudyPlanSessionType" AS ENUM ('NORMAL', 'SIMULACRO', 'SPRINT');

-- CreateTable
CREATE TABLE "StudyPlan" (
    "id" SERIAL NOT NULL,
    "community" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ratio" TEXT NOT NULL,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlanTopic" (
    "id" SERIAL NOT NULL,
    "studyPlanId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,
    "type" "StudyPlanTopicType" NOT NULL,

    CONSTRAINT "StudyPlanTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlanSession" (
    "id" SERIAL NOT NULL,
    "studyPlanId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "topicIds" INTEGER[],
    "date" TIMESTAMP(3) NOT NULL,
    "type" "StudyPlanSessionType" NOT NULL,
    "percentage" DOUBLE PRECISION,

    CONSTRAINT "StudyPlanSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlanQuiz" (
    "id" SERIAL NOT NULL,
    "studyPlanSessionId" INTEGER NOT NULL,
    "quizId" INTEGER NOT NULL,
    "optionSelected" TEXT,

    CONSTRAINT "StudyPlanQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyPlan_community_city_type_idx" ON "StudyPlan"("community", "city", "type");

-- CreateIndex
CREATE INDEX "StudyPlanTopic_studyPlanId_type_idx" ON "StudyPlanTopic"("studyPlanId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlanTopic_studyPlanId_topicId_type_key" ON "StudyPlanTopic"("studyPlanId", "topicId", "type");

-- CreateIndex
CREATE INDEX "StudyPlanSession_userId_date_idx" ON "StudyPlanSession"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlanSession_userId_studyPlanId_date_key" ON "StudyPlanSession"("userId", "studyPlanId", "date");

-- CreateIndex
CREATE INDEX "StudyPlanQuiz_quizId_idx" ON "StudyPlanQuiz"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlanQuiz_studyPlanSessionId_quizId_key" ON "StudyPlanQuiz"("studyPlanSessionId", "quizId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "StudyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanTopic" ADD CONSTRAINT "StudyPlanTopic_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanTopic" ADD CONSTRAINT "StudyPlanTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanSession" ADD CONSTRAINT "StudyPlanSession_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanSession" ADD CONSTRAINT "StudyPlanSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanQuiz" ADD CONSTRAINT "StudyPlanQuiz_studyPlanSessionId_fkey" FOREIGN KEY ("studyPlanSessionId") REFERENCES "StudyPlanSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanQuiz" ADD CONSTRAINT "StudyPlanQuiz_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
