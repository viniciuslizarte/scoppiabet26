-- Sprint 1: deadlines por fase e suporte a classificado em eliminatorias.

ALTER TABLE "Match" ADD COLUMN "advancingTeamId" TEXT;

CREATE UNIQUE INDEX "Stage_code_key" ON "Stage"("code");

ALTER TABLE "Match"
ADD CONSTRAINT "Match_advancingTeamId_fkey"
FOREIGN KEY ("advancingTeamId")
REFERENCES "Team"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
