-- AlterTable
ALTER TABLE "ResearchProject" ADD COLUMN     "description" VARCHAR(255);

-- CreateTable
CREATE TABLE "Method" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "researchProjectId" INTEGER NOT NULL,

    CONSTRAINT "Method_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Method" ADD CONSTRAINT "Method_researchProjectId_fkey" FOREIGN KEY ("researchProjectId") REFERENCES "ResearchProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
