/*
  Warnings:

  - You are about to drop the column `method` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `researchProjectId` on the `Method` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Method" DROP CONSTRAINT "Method_researchProjectId_fkey";

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "method",
ADD COLUMN     "methodId" INTEGER;

-- AlterTable
ALTER TABLE "Method" DROP COLUMN "researchProjectId";

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "Method"("id") ON DELETE SET NULL ON UPDATE CASCADE;
