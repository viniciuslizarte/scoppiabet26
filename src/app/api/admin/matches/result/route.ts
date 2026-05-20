import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { calculateMatchPoints, resolveAdvancingTeam } from "@/domain/rules";

const schema = z.object({
  matchId: z.string().min(1),
  officialHomeGoals: z.number().int().min(0).max(99),
  officialAwayGoals: z.number().int().min(0).max(99),
  advancingTeamId: z.string().min(1).nullable()
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

  const match = await prisma.match.findUnique({
    where: { id: payload.data.matchId },
    include: {
      stage: true,
      predictions: true
    }
  });

  if (!match) {
    return NextResponse.json({ error: "Jogo nao encontrado." }, { status: 404 });
  }

  let advancingTeamId: string | null = null;
  if (match.stage.code !== "GROUP") {
    try {
      advancingTeamId = resolveAdvancingTeam({
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        officialHomeGoals: payload.data.officialHomeGoals,
        officialAwayGoals: payload.data.officialAwayGoals,
        advancingTeamId: payload.data.advancingTeamId
      });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Classificado invalido." }, { status: 400 });
    }
  }

  const pointsUpdates = match.predictions.map((prediction) =>
    prisma.prediction.update({
      where: { id: prediction.id },
      data: {
        pointsAwarded: calculateMatchPoints({
          officialHomeGoals: payload.data.officialHomeGoals,
          officialAwayGoals: payload.data.officialAwayGoals,
          predictedHomeGoals: prediction.predictedHomeGoals,
          predictedAwayGoals: prediction.predictedAwayGoals
        })
      }
    })
  );

  await prisma.$transaction([
    prisma.match.update({
      where: { id: match.id },
      data: {
        officialHomeGoals: payload.data.officialHomeGoals,
        officialAwayGoals: payload.data.officialAwayGoals,
        advancingTeamId,
        isFinished: true
      }
    }),
    ...pointsUpdates
  ]);

  return NextResponse.json({
    matchId: match.id,
    predictionsUpdated: pointsUpdates.length
  });
}
