-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "pdf_name" TEXT,
ALTER COLUMN "topicId" DROP NOT NULL,
ALTER COLUMN "justification" DROP NOT NULL;
