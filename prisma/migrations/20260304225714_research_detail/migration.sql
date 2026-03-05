/*
  Warnings:

  - Made the column `name` on table `Ape` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `Location` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `Location` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `Location` required. This step will fail if there are existing NULL values in that column.
  - Made the column `xCoordinate` on table `Location` required. This step will fail if there are existing NULL values in that column.
  - Made the column `yCoordinate` on table `Location` required. This step will fail if there are existing NULL values in that column.
  - Made the column `behaviour` on table `Log` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startDatetime` on table `Log` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endDatetime` on table `Log` required. This step will fail if there are existing NULL values in that column.
  - Made the column `apeId` on table `Log` required. This step will fail if there are existing NULL values in that column.
  - Made the column `researchProjectId` on table `Log` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sessionId` on table `Log` required. This step will fail if there are existing NULL values in that column.
  - Made the column `methodId` on table `Log` required. This step will fail if there are existing NULL values in that column.
  - Made the column `researcherId` on table `Log` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `ResearchProject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startDate` on table `ResearchProject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title` on table `ResearchProject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "AgeClass" AS ENUM ('Infant', 'Juvenile', 'Subadult', 'Adult');

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_apeId_fkey";

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_methodId_fkey";

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_researchProjectId_fkey";

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_researcherId_fkey";

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_sessionId_fkey";

-- AlterTable
ALTER TABLE "Ape" ADD COLUMN     "ageClass" "AgeClass",
ADD COLUMN     "groupId" INTEGER,
ADD COLUMN     "sex" "Sex",
ADD COLUMN     "speciesId" INTEGER,
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "Location" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "xCoordinate" SET NOT NULL,
ALTER COLUMN "yCoordinate" SET NOT NULL;

-- AlterTable
ALTER TABLE "Log" ALTER COLUMN "behaviour" SET NOT NULL,
ALTER COLUMN "startDatetime" SET NOT NULL,
ALTER COLUMN "endDatetime" SET NOT NULL,
ALTER COLUMN "apeId" SET NOT NULL,
ALTER COLUMN "researchProjectId" SET NOT NULL,
ALTER COLUMN "sessionId" SET NOT NULL,
ALTER COLUMN "methodId" SET NOT NULL,
ALTER COLUMN "researcherId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ResearchProject" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "startDate" SET NOT NULL,
ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "Species" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApeGroup" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "notes" VARCHAR(500),

    CONSTRAINT "ApeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApeGroupToResearchProject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ApeGroupToResearchProject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ApeGroupToResearchProject_B_index" ON "_ApeGroupToResearchProject"("B");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_apeId_fkey" FOREIGN KEY ("apeId") REFERENCES "Ape"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_researchProjectId_fkey" FOREIGN KEY ("researchProjectId") REFERENCES "ResearchProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "Method"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "Researcher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ape" ADD CONSTRAINT "Ape_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ape" ADD CONSTRAINT "Ape_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ApeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApeGroupToResearchProject" ADD CONSTRAINT "_ApeGroupToResearchProject_A_fkey" FOREIGN KEY ("A") REFERENCES "ApeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApeGroupToResearchProject" ADD CONSTRAINT "_ApeGroupToResearchProject_B_fkey" FOREIGN KEY ("B") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
