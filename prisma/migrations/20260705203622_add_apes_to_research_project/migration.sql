-- CreateTable
CREATE TABLE "_ApeToResearchProject" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ApeToResearchProject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ApeToResearchProject_B_index" ON "_ApeToResearchProject"("B");

-- AddForeignKey
ALTER TABLE "_ApeToResearchProject" ADD CONSTRAINT "_ApeToResearchProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Ape"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApeToResearchProject" ADD CONSTRAINT "_ApeToResearchProject_B_fkey" FOREIGN KEY ("B") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
