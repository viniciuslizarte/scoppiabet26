import { describe, expect, it } from "vitest";
import {
  CHAMPION_BONUS_POINTS,
  EXACT_SCORE_POINTS,
  RESULT_ONLY_POINTS,
  applyChampionBonus,
  canEditPrediction,
  calculateBalanceAfterBet,
  calculateBetReturnCents,
  calculateInitialVariableFund,
  calculateMatchPoints,
  calculatePhaseStake,
  calculatePrizeDistribution,
  isStageLocked,
  resolveAdvancingTeam,
  resolveMajorityBet,
  sortRanking
} from "@/domain/rules";

describe("rules", () => {
  it("pontua placar exato com 10", () => {
    const points = calculateMatchPoints({
      officialHomeGoals: 2,
      officialAwayGoals: 1,
      predictedHomeGoals: 2,
      predictedAwayGoals: 1
    });
    expect(points).toBe(EXACT_SCORE_POINTS);
  });

  it("pontua apenas resultado com 5", () => {
    const points = calculateMatchPoints({
      officialHomeGoals: 3,
      officialAwayGoals: 1,
      predictedHomeGoals: 1,
      predictedAwayGoals: 0
    });
    expect(points).toBe(RESULT_ONLY_POINTS);
  });

  it("adiciona bonus de campeao", () => {
    expect(applyChampionBonus(40, true)).toBe(40 + CHAMPION_BONUS_POINTS);
    expect(applyChampionBonus(40, false)).toBe(40);
  });

  it("resolve maioria simples", () => {
    const decision = resolveMajorityBet({
      homeVotes: 8,
      drawVotes: 2,
      awayVotes: 1,
      favoriteByOdds: "DRAW"
    });
    expect(decision.selected).toBe("HOME");
    expect(decision.byTieBreaker).toBe(false);
  });

  it("resolve empate de votos pela favorita da casa", () => {
    const decision = resolveMajorityBet({
      homeVotes: 5,
      drawVotes: 5,
      awayVotes: 1,
      favoriteByOdds: "DRAW"
    });
    expect(decision.selected).toBe("DRAW");
    expect(decision.byTieBreaker).toBe(true);
  });

  it("calcula stake por fase", () => {
    expect(calculatePhaseStake(10000, 20)).toBe(500);
  });

  it("calcula fundo inicial e retorno financeiro da Bet do Bolao", () => {
    expect(calculateInitialVariableFund(17)).toBe(17000);
    expect(calculateBetReturnCents({ stakeCents: 1000, odd: 2.5, status: "WON" })).toBe(2500);
    expect(calculateBetReturnCents({ stakeCents: 1000, odd: 2.5, status: "LOST" })).toBe(0);
    expect(calculateBetReturnCents({ stakeCents: 1000, odd: 2.5, status: "VOID" })).toBe(1000);
    expect(calculateBalanceAfterBet({ balanceBeforeCents: 5000, stakeCents: 1000, returnCents: 2500 })).toBe(6500);
  });

  it("calcula premiacao 70/20/10", () => {
    const prizes = calculatePrizeDistribution(12345);
    expect(prizes.first + prizes.second + prizes.third).toBe(12345);
  });

  it("bloqueia edicao de palpites apos o prazo da fase", () => {
    const lockAt = new Date("2026-06-10T22:00:00.000Z");

    expect(canEditPrediction({ lockAt, now: new Date("2026-06-10T21:59:59.000Z") })).toBe(true);
    expect(isStageLocked({ lockAt, now: new Date("2026-06-10T22:00:00.000Z") })).toBe(true);
    expect(canEditPrediction({ lockAt, now: new Date("2026-06-10T22:00:00.000Z") })).toBe(false);
  });

  it("resolve classificado no mata-mata pelo placar de 90 minutos quando ha vencedor", () => {
    expect(
      resolveAdvancingTeam({
        homeTeamId: "BRA",
        awayTeamId: "FRA",
        officialHomeGoals: 2,
        officialAwayGoals: 1
      })
    ).toBe("BRA");
  });

  it("exige classificado manual quando mata-mata termina empatado nos 90 minutos", () => {
    expect(
      resolveAdvancingTeam({
        homeTeamId: "BRA",
        awayTeamId: "FRA",
        officialHomeGoals: 1,
        officialAwayGoals: 1,
        advancingTeamId: "FRA"
      })
    ).toBe("FRA");

    expect(() =>
      resolveAdvancingTeam({
        homeTeamId: "BRA",
        awayTeamId: "FRA",
        officialHomeGoals: 1,
        officialAwayGoals: 1
      })
    ).toThrow("Jogos eliminatorios empatados precisam informar quem avancou.");
  });

  it("ordena ranking por pontos, bonus de campeao e placares exatos", () => {
    const ranking = sortRanking([
      { participantId: "1", displayName: "Ana", points: 50, exactScoreHits: 2, championHit: false },
      { participantId: "2", displayName: "Bruno", points: 55, exactScoreHits: 1, championHit: false },
      { participantId: "3", displayName: "Caio", points: 50, exactScoreHits: 1, championHit: true },
      { participantId: "4", displayName: "Duda", points: 50, exactScoreHits: 3, championHit: true }
    ]);

    expect(ranking.map((item) => item.displayName)).toEqual(["Bruno", "Duda", "Caio", "Ana"]);
  });
});
