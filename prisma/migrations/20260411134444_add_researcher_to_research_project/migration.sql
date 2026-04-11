-- CreateTable
CREATE TABLE "_ResearchProjectToResearcher" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ResearchProjectToResearcher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ResearchProjectToResearcher_B_index" ON "_ResearchProjectToResearcher"("B");

-- AddForeignKey
ALTER TABLE "_ResearchProjectToResearcher" ADD CONSTRAINT "_ResearchProjectToResearcher_A_fkey" FOREIGN KEY ("A") REFERENCES "ResearchProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResearchProjectToResearcher" ADD CONSTRAINT "_ResearchProjectToResearcher_B_fkey" FOREIGN KEY ("B") REFERENCES "Researcher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
