-- Sprint 5: controle operacional da Bet do Bolao.

CREATE TYPE "BetSettlementStatus" AS ENUM ('PENDING', 'WON', 'LOST', 'VOID');

ALTER TABLE "BetDecision" ADD COLUMN "balanceBeforeCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BetDecision" ADD COLUMN "returnCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BetDecision" ADD COLUMN "balanceAfterCents" INTEGER;
ALTER TABLE "BetDecision" ADD COLUMN "settlementStatus" "BetSettlementStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "BetDecision" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
