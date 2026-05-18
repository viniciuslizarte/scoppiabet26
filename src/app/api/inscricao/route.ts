import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const inscricaoSchema = z.object({
  displayName: z.string().min(3),
  championTeamId: z.string().min(1)
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }
  if (session.user.role === "ADMIN") {
    return NextResponse.json({ error: "Conta administrativa nao participa do bolao." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = inscricaoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const team = await prisma.team.findUnique({ where: { id: parsed.data.championTeamId } });
  if (!team) return NextResponse.json({ error: "Selecao invalida." }, { status: 400 });

  const existing = await prisma.participantProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (existing?.championTeamId) {
    return NextResponse.json(
      { error: "Selecao campea ja foi definida e nao pode ser alterada." },
      { status: 409 }
    );
  }

  const profile = existing
    ? await prisma.participantProfile.update({
        where: { userId: session.user.id },
        data: {
          displayName: parsed.data.displayName,
          championTeamId: parsed.data.championTeamId
        }
      })
    : await prisma.participantProfile.create({
        data: {
          userId: session.user.id,
          displayName: parsed.data.displayName,
          championTeamId: parsed.data.championTeamId,
          paidAmountCents: 0,
          paymentStatus: "PENDING"
        }
      });

  return NextResponse.json({
    participantId: profile.id,
    paymentStatus: profile.paymentStatus,
    paidAmountCents: profile.paidAmountCents
  });
}
