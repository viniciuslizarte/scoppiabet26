import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditPrediction } from "@/domain/rules";

const predictionSchema = z.object({
  matchId: z.string().min(1),
  predictedHomeGoals: z.number().int().min(0).max(99),
  predictedAwayGoals: z.number().int().min(0).max(99)
});

const schema = z.object({
  predictions: z.array(predictionSchema).max(104)
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }
  if (session.user.role === "ADMIN") {
    return NextResponse.json({ error: "Conta administrativa nao participa do bolao." }, { status: 403 });
  }

  const payload = schema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const profile = await prisma.participantProfile.findUnique({
    where: { userId: session.user.id }
  });
  if (!profile) {
    return NextResponse.json({ error: "Inscricao nao encontrada." }, { status: 404 });
  }

  const uniquePredictions = Array.from(
    new Map(payload.data.predictions.map((prediction) => [prediction.matchId, prediction])).values()
  );

  if (uniquePredictions.length === 0) {
    return NextResponse.json({ saved: 0 });
  }

  const matches = await prisma.match.findMany({
    where: {
      id: { in: uniquePredictions.map((prediction) => prediction.matchId) }
    },
    include: { stage: true }
  });

  if (matches.length !== uniquePredictions.length) {
    return NextResponse.json({ error: "Um ou mais jogos sao invalidos." }, { status: 400 });
  }

  const lockedMatch = matches.find((match) => !canEditPrediction({ lockAt: match.stage.lockAt }));
  if (lockedMatch) {
    return NextResponse.json({ error: "O prazo desta fase encerrou. Palpites bloqueados." }, { status: 409 });
  }

  await prisma.$transaction(
    uniquePredictions.map((prediction) =>
      prisma.prediction.upsert({
        where: {
          participantId_matchId: {
            participantId: profile.id,
            matchId: prediction.matchId
          }
        },
        update: {
          predictedHomeGoals: prediction.predictedHomeGoals,
          predictedAwayGoals: prediction.predictedAwayGoals
        },
        create: {
          participantId: profile.id,
          matchId: prediction.matchId,
          predictedHomeGoals: prediction.predictedHomeGoals,
          predictedAwayGoals: prediction.predictedAwayGoals
        }
      })
    )
  );

  return NextResponse.json({ saved: uniquePredictions.length });
}
