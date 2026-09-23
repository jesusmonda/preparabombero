-- Add the user who created each report. Existing reports remain valid without a reporter.
ALTER TABLE "Report" ADD COLUMN "userId" INTEGER;

CREATE INDEX "Report_userId_idx" ON "Report"("userId");

ALTER TABLE "Report"
ADD CONSTRAINT "Report_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
