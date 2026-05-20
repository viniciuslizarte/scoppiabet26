-- Configuracao administrativa da selecao campea oficial.

CREATE TABLE "AppConfig" (
  "id" TEXT NOT NULL,
  "singletonKey" TEXT NOT NULL,
  "championTeamId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AppConfig_singletonKey_key" ON "AppConfig"("singletonKey");

ALTER TABLE "AppConfig"
ADD CONSTRAINT "AppConfig_championTeamId_fkey"
FOREIGN KEY ("championTeamId")
REFERENCES "Team"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
