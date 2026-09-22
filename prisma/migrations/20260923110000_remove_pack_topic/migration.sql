-- DropForeignKey
ALTER TABLE "Pack" DROP CONSTRAINT "Pack_topicId_fkey";

-- DropIndex
DROP INDEX "Pack_topicId_idx";

-- AlterTable
ALTER TABLE "Pack" DROP COLUMN "topicId";
