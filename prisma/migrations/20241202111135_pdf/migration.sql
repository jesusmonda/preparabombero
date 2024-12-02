/*
  Warnings:

  - Added the required column `name` to the `Pdf` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pdf" ADD COLUMN     "name" TEXT NOT NULL;
INSERT INTO "Pdf" (id, community,city,"year","type",subtype,name) VALUES (0, 'e','e','e','e','e','e');

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "pdfId" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_pdfId_fkey" FOREIGN KEY ("pdfId") REFERENCES "Pdf"("id") ON DELETE CASCADE ON UPDATE CASCADE;
