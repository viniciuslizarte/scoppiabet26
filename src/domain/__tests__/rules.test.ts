import { describe, expect, it } from "vitest";
import {
  CHAMPION_BONUS_POINTS,
  EXACT_SCORE_POINTS,
  RESULT_ONLY_POINTS,
  applyChampionBonus,
  calculateMatchPoints,
  calculatePhaseStake,
  calculatePrizeDistribution,
  resolveMajorityBet
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

  it("calcula premiacao 70/20/10", () => {
    const prizes = calculatePrizeDistribution(12345);
    expect(prizes.first + prizes.second + prizes.third).toBe(12345);
  });
});
