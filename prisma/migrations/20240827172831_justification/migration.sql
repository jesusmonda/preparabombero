/*
  Warnings:

  - Added the required column `justification` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "justification" TEXT NOT NULL;
