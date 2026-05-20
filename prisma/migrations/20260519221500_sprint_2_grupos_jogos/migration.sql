-- Sprint 2: estrutura de grupos, selecoes e jogos da fase de grupos.

CREATE TABLE "WorldCupGroup" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL,

  CONSTRAINT "WorldCupGroup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorldCupGroup_code_key" ON "WorldCupGroup"("code");

ALTER TABLE "Team" ADD COLUMN "groupId" TEXT;
ALTER TABLE "Team" ADD COLUMN "groupPosition" INTEGER;

CREATE UNIQUE INDEX "Team_groupId_groupPosition_key" ON "Team"("groupId", "groupPosition");

ALTER TABLE "Team"
ADD CONSTRAINT "Team_groupId_fkey"
FOREIGN KEY ("groupId")
REFERENCES "WorldCupGroup"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Match" ADD COLUMN "matchNumber" INTEGER;
ALTER TABLE "Match" ADD COLUMN "groupId" TEXT;
ALTER TABLE "Match" ADD COLUMN "venue" TEXT;
ALTER TABLE "Match" ALTER COLUMN "kickoffAt" DROP NOT NULL;

CREATE UNIQUE INDEX "Match_matchNumber_key" ON "Match"("matchNumber");

ALTER TABLE "Match"
ADD CONSTRAINT "Match_groupId_fkey"
FOREIGN KEY ("groupId")
REFERENCES "WorldCupGroup"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
