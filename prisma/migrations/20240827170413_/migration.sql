/*
  Warnings:

  - A unique constraint covering the columns `[reason]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
CREATE SEQUENCE topic_order_seq;
ALTER TABLE "Topic" ALTER COLUMN "order" SET DEFAULT nextval('topic_order_seq');
ALTER SEQUENCE topic_order_seq OWNED BY "Topic"."order";

-- CreateIndex
CREATE UNIQUE INDEX "Report_reason_key" ON "Report"("reason");
