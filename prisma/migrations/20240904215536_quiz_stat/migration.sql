-- DropIndex
DROP INDEX "User_password_key";

-- CreateTable
CREATE TABLE "QuizStat" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "success" INTEGER NOT NULL,
    "fail" INTEGER NOT NULL,
    "not_answered" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizStat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizStat" ADD CONSTRAINT "QuizStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
