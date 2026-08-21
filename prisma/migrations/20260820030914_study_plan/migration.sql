-- AlterTable
ALTER TABLE "User" ADD COLUMN     "examEstimatedDate" DATE,
ADD COLUMN     "studyPlanId" INTEGER;

-- CreateTable
CREATE TABLE "StudyPlan" (
    "id" SERIAL NOT NULL,
    "topicEspecificoId" INTEGER NOT NULL,
    "topicLegislacionId" INTEGER NOT NULL,
    "topicTerritorialId" INTEGER NOT NULL,
    "studyPlanCommunity" TEXT NOT NULL,
    "studyPlanCity" TEXT NOT NULL,
    "studyPlanType" TEXT NOT NULL,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlanTopic" (
    "id" SERIAL NOT NULL,
    "studyPlanId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "topicEspecificoId" INTEGER NOT NULL,
    "topicLegislacionId" INTEGER NOT NULL,
    "topicTerritorialId" INTEGER NOT NULL,
    "examDate" DATE NOT NULL,
    "percentage" DOUBLE PRECISION,

    CONSTRAINT "StudyPlanTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlanQuiz" (
    "id" SERIAL NOT NULL,
    "studyPlanTopicId" INTEGER NOT NULL,
    "quizId" INTEGER NOT NULL,
    "optionSelected" TEXT,
    "optionCorrect" TEXT,

    CONSTRAINT "StudyPlanQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyPlan_studyPlanCommunity_studyPlanCity_studyPlanType_idx" ON "StudyPlan"("studyPlanCommunity", "studyPlanCity", "studyPlanType");

-- CreateIndex
CREATE INDEX "StudyPlanTopic_userId_examDate_idx" ON "StudyPlanTopic"("userId", "examDate");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlanTopic_userId_studyPlanId_topicEspecificoId_topicLe_key" ON "StudyPlanTopic"("userId", "studyPlanId", "topicEspecificoId", "topicLegislacionId", "topicTerritorialId", "examDate");

-- CreateIndex
CREATE INDEX "StudyPlanQuiz_quizId_idx" ON "StudyPlanQuiz"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlanQuiz_studyPlanTopicId_quizId_key" ON "StudyPlanQuiz"("studyPlanTopicId", "quizId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "StudyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_topicEspecificoId_fkey" FOREIGN KEY ("topicEspecificoId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_topicLegislacionId_fkey" FOREIGN KEY ("topicLegislacionId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_topicTerritorialId_fkey" FOREIGN KEY ("topicTerritorialId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanTopic" ADD CONSTRAINT "StudyPlanTopic_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanTopic" ADD CONSTRAINT "StudyPlanTopic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanTopic" ADD CONSTRAINT "StudyPlanTopic_topicEspecificoId_fkey" FOREIGN KEY ("topicEspecificoId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanTopic" ADD CONSTRAINT "StudyPlanTopic_topicLegislacionId_fkey" FOREIGN KEY ("topicLegislacionId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanTopic" ADD CONSTRAINT "StudyPlanTopic_topicTerritorialId_fkey" FOREIGN KEY ("topicTerritorialId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanQuiz" ADD CONSTRAINT "StudyPlanQuiz_studyPlanTopicId_fkey" FOREIGN KEY ("studyPlanTopicId") REFERENCES "StudyPlanTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanQuiz" ADD CONSTRAINT "StudyPlanQuiz_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
