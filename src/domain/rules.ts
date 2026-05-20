export const ENTRY_FEE_CENTS = 6000;
export const FIXED_FUND_CENTS = 5000;
export const VARIABLE_FUND_CENTS = 1000;
export const EXACT_SCORE_POINTS = 10;
export const RESULT_ONLY_POINTS = 5;
export const CHAMPION_BONUS_POINTS = 20;

export type Outcome = "HOME" | "DRAW" | "AWAY";
export type BetOption = Outcome;

export function getOutcome(homeGoals: number, awayGoals: number): Outcome {
  if (homeGoals > awayGoals) return "HOME";
  if (homeGoals < awayGoals) return "AWAY";
  return "DRAW";
}

export function calculateMatchPoints(params: {
  officialHomeGoals: number;
  officialAwayGoals: number;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
}): number {
  const {
    officialHomeGoals,
    officialAwayGoals,
    predictedHomeGoals,
    predictedAwayGoals
  } = params;

  const exactHome = officialHomeGoals === predictedHomeGoals;
  const exactAway = officialAwayGoals === predictedAwayGoals;

  if (exactHome && exactAway) return EXACT_SCORE_POINTS;

  const officialOutcome = getOutcome(officialHomeGoals, officialAwayGoals);
  const predictedOutcome = getOutcome(predictedHomeGoals, predictedAwayGoals);
  return officialOutcome === predictedOutcome ? RESULT_ONLY_POINTS : 0;
}

export function applyChampionBonus(basePoints: number, championHit: boolean): number {
  return championHit ? basePoints + CHAMPION_BONUS_POINTS : basePoints;
}

export function resolveMajorityBet(params: {
  homeVotes: number;
  drawVotes: number;
  awayVotes: number;
  // Favorita da casa em caso de empate de votos.
  favoriteByOdds: BetOption;
}): { selected: BetOption; byTieBreaker: boolean } {
  const { homeVotes, drawVotes, awayVotes, favoriteByOdds } = params;
  const pairs: Array<{ option: BetOption; votes: number }> = [
    { option: "HOME", votes: homeVotes },
    { option: "DRAW", votes: drawVotes },
    { option: "AWAY", votes: awayVotes }
  ];

  const maxVotes = Math.max(homeVotes, drawVotes, awayVotes);
  const leaders = pairs.filter((item) => item.votes === maxVotes);

  if (leaders.length === 1) {
    return { selected: leaders[0].option, byTieBreaker: false };
  }

  return { selected: favoriteByOdds, byTieBreaker: true };
}

export function calculatePhaseStake(balanceCents: number, gamesRemainingInPhase: number): number {
  if (gamesRemainingInPhase <= 0) return 0;
  return Math.floor(balanceCents / gamesRemainingInPhase);
}

export function calculatePrizeDistribution(totalCents: number) {
  const first = Math.floor(totalCents * 0.7);
  const second = Math.floor(totalCents * 0.2);
  const third = totalCents - first - second;

  return { first, second, third };
}

export function calculateInitialVariableFund(participantsCount: number): number {
  return participantsCount * VARIABLE_FUND_CENTS;
}

export function calculateBetReturnCents(params: {
  stakeCents: number;
  odd: number;
  status: "PENDING" | "WON" | "LOST" | "VOID";
}): number {
  if (params.status === "WON") return Math.floor(params.stakeCents * params.odd);
  if (params.status === "VOID") return params.stakeCents;
  return 0;
}

export function calculateBalanceAfterBet(params: {
  balanceBeforeCents: number;
  stakeCents: number;
  returnCents: number;
}): number {
  return params.balanceBeforeCents - params.stakeCents + params.returnCents;
}

export function isStageLocked(params: { lockAt: Date; now?: Date }): boolean {
  const now = params.now ?? new Date();
  return now >= params.lockAt;
}

export function canEditPrediction(params: { lockAt: Date; now?: Date }): boolean {
  return !isStageLocked(params);
}

export function resolveAdvancingTeam(params: {
  homeTeamId: string;
  awayTeamId: string;
  officialHomeGoals: number;
  officialAwayGoals: number;
  advancingTeamId?: string | null;
}): string {
  const {
    homeTeamId,
    awayTeamId,
    officialHomeGoals,
    officialAwayGoals,
    advancingTeamId
  } = params;

  const outcome = getOutcome(officialHomeGoals, officialAwayGoals);
  if (outcome === "HOME") return homeTeamId;
  if (outcome === "AWAY") return awayTeamId;

  if (!advancingTeamId) {
    throw new Error("Jogos eliminatorios empatados precisam informar quem avancou.");
  }

  if (advancingTeamId !== homeTeamId && advancingTeamId !== awayTeamId) {
    throw new Error("A selecao classificada deve ser uma das selecoes do jogo.");
  }

  return advancingTeamId;
}

export type RankingParticipant = {
  participantId: string;
  displayName: string;
  points: number;
  exactScoreHits: number;
  championHit: boolean;
};

export function sortRanking(participants: RankingParticipant[]): RankingParticipant[] {
  return [...participants].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (Number(b.championHit) !== Number(a.championHit)) {
      return Number(b.championHit) - Number(a.championHit);
    }
    if (b.exactScoreHits !== a.exactScoreHits) return b.exactScoreHits - a.exactScoreHits;
    return a.displayName.localeCompare(b.displayName);
  });
}
