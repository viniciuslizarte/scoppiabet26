import type { BetOption } from "@/domain/rules";
import { calculateInitialVariableFund, getOutcome, resolveMajorityBet } from "@/domain/rules";
import { prisma } from "@/lib/prisma";

type DecisionInput = {
  matchId: string;
  favoriteByOdds: BetOption;
};

export async function getBetCurrentBalanceCents() {
  const confirmedParticipants = await prisma.participantProfile.count({
    where: { paymentStatus: "CONFIRMED" }
  });
  const initialBalance = calculateInitialVariableFund(confirmedParticipants);
  const decisions = await prisma.betDecision.findMany({
    orderBy: [{ createdAt: "asc" }, { id: "asc" }]
  });

  return decisions.reduce((balance, decision) => {
    if (decision.balanceAfterCents !== null) return decision.balanceAfterCents;
    return balance - decision.stakeCents + decision.returnCents;
  }, initialBalance);
}

export async function resolveBetDecisionFromPredictions({ matchId, favoriteByOdds }: DecisionInput) {
  const predictions = await prisma.prediction.findMany({
    where: {
      matchId,
      participant: { paymentStatus: "CONFIRMED" }
    }
  });

  const votes = predictions.reduce(
    (acc, prediction) => {
      const outcome = getOutcome(prediction.predictedHomeGoals, prediction.predictedAwayGoals);
      acc[outcome] += 1;
      return acc;
    },
    { HOME: 0, DRAW: 0, AWAY: 0 }
  );

  const decision = resolveMajorityBet({
    homeVotes: votes.HOME,
    drawVotes: votes.DRAW,
    awayVotes: votes.AWAY,
    favoriteByOdds
  });

  return {
    votes,
    selectedOption: decision.selected,
    decisionType: decision.byTieBreaker ? "ODDS_TIEBREAKER" : "MAJORITY"
  } as const;
}
