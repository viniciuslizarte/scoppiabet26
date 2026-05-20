import { applyChampionBonus, sortRanking } from "@/domain/rules";
import { prisma } from "@/lib/prisma";

type RankingOptions = {
  championTeamId?: string | null;
};

export async function getRanking({ championTeamId = null }: RankingOptions = {}) {
  const participants = await prisma.participantProfile.findMany({
    where: { paymentStatus: "CONFIRMED" },
    include: {
      predictions: true
    }
  });

  return sortRanking(
    participants.map((participant) => {
      const basePoints = participant.predictions.reduce((sum, prediction) => sum + prediction.pointsAwarded, 0);
      const championHit = Boolean(championTeamId && participant.championTeamId === championTeamId);
      const points = applyChampionBonus(basePoints, championHit);
      const exactScoreHits = participant.predictions.filter((prediction) => prediction.pointsAwarded === 10).length;

      return {
        participantId: participant.id,
        displayName: participant.displayName,
        points,
        exactScoreHits,
        championHit
      };
    })
  );
}
