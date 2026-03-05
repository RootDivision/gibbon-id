/*
  Warnings:

  - You are about to drop the column `location` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `locationType` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `researcher` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ResearchProject` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Log" DROP COLUMN "location",
DROP COLUMN "locationType",
DROP COLUMN "researcher",
ADD COLUMN     "researcherId" INTEGER;

-- AlterTable
ALTER TABLE "ResearchProject" DROP COLUMN "name",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "title" VARCHAR(255);

-- CreateTable
CREATE TABLE "Researcher" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,

    CONSTRAINT "Researcher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "country" VARCHAR(255),
    "type" VARCHAR(255),
    "xCoordinate" DOUBLE PRECISION,
    "yCoordinate" DOUBLE PRECISION,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LocationToResearchProject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_LocationToResearchProject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LocationToResearchProject_B_index" ON "_LocationToResearchProject"("B");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "Researcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationToResearchProject" ADD CONSTRAINT "_LocationToResearchProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationToResearchProject" ADD CONSTRAINT "_LocationToResearchProject_B_fkey" FOREIGN KEY ("B") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
