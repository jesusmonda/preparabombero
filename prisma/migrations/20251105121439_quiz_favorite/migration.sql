-- AlterTable
ALTER TABLE "User" ALTER COLUMN "token" DROP DEFAULT;

-- CreateTable
CREATE TABLE "QuizFavorite" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "quizId" INTEGER NOT NULL,

    CONSTRAINT "QuizFavorite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizFavorite" ADD CONSTRAINT "QuizFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizFavorite" ADD CONSTRAINT "QuizFavorite_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
