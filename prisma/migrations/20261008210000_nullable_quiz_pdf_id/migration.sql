-- Quiz questions can exist without an associated PDF.
ALTER TABLE "Quiz" ALTER COLUMN "pdfId" DROP DEFAULT;
ALTER TABLE "Quiz" ALTER COLUMN "pdfId" DROP NOT NULL;
