/*
  Warnings:

  - Added the required column `pdfId` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "Pdf" (
    "id" SERIAL NOT NULL,
    "community" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,

    CONSTRAINT "Pdf_pkey" PRIMARY KEY ("id")
);