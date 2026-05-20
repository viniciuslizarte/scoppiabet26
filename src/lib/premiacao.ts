import { FIXED_FUND_CENTS, calculatePrizeDistribution } from "@/domain/rules";
import { getBetCurrentBalanceCents } from "@/lib/bet-do-bolao";
import { prisma } from "@/lib/prisma";
import { getRanking } from "@/lib/ranking";

export async function getPremiacaoResumo() {
  const confirmedParticipants = await prisma.participantProfile.count({
    where: { paymentStatus: "CONFIRMED" }
  });
  const fixedFundCents = confirmedParticipants * FIXED_FUND_CENTS;
  const betBalanceCents = await getBetCurrentBalanceCents();
  const totalPrizeCents = fixedFundCents + betBalanceCents;
  const distribution = calculatePrizeDistribution(totalPrizeCents);
  const appConfig = await prisma.appConfig.findUnique({
    where: { singletonKey: "global" },
    include: { championTeam: true }
  });
  const ranking = await getRanking({ championTeamId: appConfig?.championTeamId ?? null });

  return {
    confirmedParticipants,
    championTeam: appConfig?.championTeam ?? null,
    fixedFundCents,
    betBalanceCents,
    totalPrizeCents,
    distribution,
    ranking
  };
}
