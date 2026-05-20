import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

const schema = z.object({
  matchId: z.string().min(1),
  kickoffAt: z.string().datetime().nullable(),
  venue: z.string().trim().min(1).max(120).nullable()
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

  const updated = await prisma.match.update({
    where: { id: payload.data.matchId },
    data: {
      kickoffAt: payload.data.kickoffAt ? new Date(payload.data.kickoffAt) : null,
      venue: payload.data.venue
    }
  });

  return NextResponse.json({
    matchId: updated.id,
    kickoffAt: updated.kickoffAt,
    venue: updated.venue
  });
}
