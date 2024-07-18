-- CreateTable
CREATE TABLE "Info" (
    "id" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Info_title_key" ON "Info"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Info_description_key" ON "Info"("description");
