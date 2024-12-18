/*
  Warnings:

  - A unique constraint covering the columns `[title,option1,option2,option3,option4,pdf_name]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Quiz_title_option1_option2_option3_option4_pdf_name_key" ON "Quiz"(left("title",255), left("option1",255), left("option2",255), left("option3",255), left("option4",255), left("pdf_name", 255));
