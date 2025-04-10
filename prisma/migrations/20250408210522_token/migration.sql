/*
  Warnings:

  - A unique constraint covering the columns `[title,option1,option2,option3,option4,pdf_name]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - The required column `token` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "token" TEXT NOT NULL DEFAULT 0;