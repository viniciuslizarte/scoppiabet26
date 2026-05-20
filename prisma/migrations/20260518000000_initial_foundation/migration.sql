-- Initial foundation schema before Sprint 1+ production migrations.

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ORGANIZACAO', 'PARTICIPANTE');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED');
CREATE TYPE "StageCode" AS ENUM ('GROUP', 'R32', 'R16', 'QF', 'SF', 'FINAL');
CREATE TYPE "BetOption" AS ENUM ('HOME', 'DRAW', 'AWAY');
CREATE TYPE "BetDecisionType" AS ENUM ('MAJORITY', 'ODDS_TIEBREAKER');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'PARTICIPANTE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ParticipantProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "paidAmountCents" INTEGER NOT NULL DEFAULT 0,
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "championTeamId" TEXT,
  "exactScoreHits" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ParticipantProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Team" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "fifaCode" TEXT NOT NULL,

  CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Stage" (
  "id" TEXT NOT NULL,
  "code" "StageCode" NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "lockAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Match" (
  "id" TEXT NOT NULL,
  "stageId" TEXT NOT NULL,
  "homeTeamId" TEXT NOT NULL,
  "awayTeamId" TEXT NOT NULL,
  "kickoffAt" TIMESTAMP(3) NOT NULL,
  "officialHomeGoals" INTEGER,
  "officialAwayGoals" INTEGER,
  "isFinished" BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Prediction" (
  "id" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "predictedHomeGoals" INTEGER NOT NULL,
  "predictedAwayGoals" INTEGER NOT NULL,
  "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BetVote" (
  "id" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "option" "BetOption" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BetVote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BetDecision" (
  "id" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "selectedOption" "BetOption" NOT NULL,
  "decisionType" "BetDecisionType" NOT NULL,
  "selectedOdd" DECIMAL(8,3) NOT NULL,
  "stakeCents" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BetDecision_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "ParticipantProfile_userId_key" ON "ParticipantProfile"("userId");
CREATE UNIQUE INDEX "Team_fifaCode_key" ON "Team"("fifaCode");
CREATE UNIQUE INDEX "Prediction_participantId_matchId_key" ON "Prediction"("participantId", "matchId");
CREATE UNIQUE INDEX "BetVote_matchId_participantId_key" ON "BetVote"("matchId", "participantId");
CREATE UNIQUE INDEX "BetDecision_matchId_key" ON "BetDecision"("matchId");

ALTER TABLE "ParticipantProfile"
ADD CONSTRAINT "ParticipantProfile_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "ParticipantProfile"
ADD CONSTRAINT "ParticipantProfile_championTeamId_fkey"
FOREIGN KEY ("championTeamId")
REFERENCES "Team"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Match"
ADD CONSTRAINT "Match_stageId_fkey"
FOREIGN KEY ("stageId")
REFERENCES "Stage"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Match"
ADD CONSTRAINT "Match_homeTeamId_fkey"
FOREIGN KEY ("homeTeamId")
REFERENCES "Team"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Match"
ADD CONSTRAINT "Match_awayTeamId_fkey"
FOREIGN KEY ("awayTeamId")
REFERENCES "Team"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Prediction"
ADD CONSTRAINT "Prediction_participantId_fkey"
FOREIGN KEY ("participantId")
REFERENCES "ParticipantProfile"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Prediction"
ADD CONSTRAINT "Prediction_matchId_fkey"
FOREIGN KEY ("matchId")
REFERENCES "Match"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "BetVote"
ADD CONSTRAINT "BetVote_matchId_fkey"
FOREIGN KEY ("matchId")
REFERENCES "Match"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "BetVote"
ADD CONSTRAINT "BetVote_participantId_fkey"
FOREIGN KEY ("participantId")
REFERENCES "ParticipantProfile"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "BetDecision"
ADD CONSTRAINT "BetDecision_matchId_fkey"
FOREIGN KEY ("matchId")
REFERENCES "Match"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
