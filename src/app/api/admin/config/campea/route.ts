import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  championTeamId: z.string().min(1).nullable()
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

  if (payload.data.championTeamId) {
    const team = await prisma.team.findUnique({ where: { id: payload.data.championTeamId } });
    if (!team) {
      return NextResponse.json({ error: "Selecao invalida." }, { status: 400 });
    }
  }

  const config = await prisma.appConfig.upsert({
    where: { singletonKey: "global" },
    update: { championTeamId: payload.data.championTeamId },
    create: {
      singletonKey: "global",
      championTeamId: payload.data.championTeamId
    }
  });

  return NextResponse.json({
    championTeamId: config.championTeamId
  });
}
