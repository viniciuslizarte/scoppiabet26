import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getBetCurrentBalanceCents, resolveBetDecisionFromPredictions } from "@/lib/bet-do-bolao";
import { calculateBalanceAfterBet, calculateBetReturnCents } from "@/domain/rules";

const schema = z.object({
  matchId: z.string().min(1),
  favoriteByOdds: z.enum(["HOME", "DRAW", "AWAY"]),
  selectedOdd: z.number().positive().max(999),
  stakeCents: z.number().int().positive(),
  settlementStatus: z.enum(["PENDING", "WON", "LOST", "VOID"]).default("PENDING")
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const payload = schema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: payload.data.matchId } });
  if (!match) {
    return NextResponse.json({ error: "Jogo nao encontrado." }, { status: 404 });
  }

  const balanceBeforeCents = await getBetCurrentBalanceCents();
  if (payload.data.stakeCents > balanceBeforeCents) {
    return NextResponse.json({ error: "Stake maior que o saldo atual da banca." }, { status: 400 });
  }

  const decision = await resolveBetDecisionFromPredictions({
    matchId: payload.data.matchId,
    favoriteByOdds: payload.data.favoriteByOdds
  });
  const returnCents = calculateBetReturnCents({
    stakeCents: payload.data.stakeCents,
    odd: payload.data.selectedOdd,
    status: payload.data.settlementStatus
  });
  const balanceAfterCents =
    payload.data.settlementStatus === "PENDING"
      ? null
      : calculateBalanceAfterBet({
          balanceBeforeCents,
          stakeCents: payload.data.stakeCents,
          returnCents
        });

  const saved = await prisma.betDecision.upsert({
    where: { matchId: payload.data.matchId },
    update: {
      selectedOption: decision.selectedOption,
      decisionType: decision.decisionType,
      selectedOdd: payload.data.selectedOdd,
      stakeCents: payload.data.stakeCents,
      balanceBeforeCents,
      returnCents,
      balanceAfterCents,
      settlementStatus: payload.data.settlementStatus
    },
    create: {
      matchId: payload.data.matchId,
      selectedOption: decision.selectedOption,
      decisionType: decision.decisionType,
      selectedOdd: payload.data.selectedOdd,
      stakeCents: payload.data.stakeCents,
      balanceBeforeCents,
      returnCents,
      balanceAfterCents,
      settlementStatus: payload.data.settlementStatus
    }
  });

  return NextResponse.json({
    betDecisionId: saved.id,
    selectedOption: saved.selectedOption,
    decisionType: saved.decisionType,
    votes: decision.votes,
    balanceBeforeCents,
    balanceAfterCents
  });
}
