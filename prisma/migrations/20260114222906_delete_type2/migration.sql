/*
  Warnings:

  - You are about to drop the column `subtype2` on the `Pdf` table. All the data in the column will be lost.
  - You are about to drop the column `type2` on the `Pdf` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pdf" DROP COLUMN "subtype2",
DROP COLUMN "type2";
