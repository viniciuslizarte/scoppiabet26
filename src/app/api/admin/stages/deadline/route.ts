import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

const schema = z.object({
  stageId: z.string().min(1),
  lockAt: z.string().datetime()
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

  const lockAt = new Date(payload.data.lockAt);
  const updated = await prisma.stage.update({
    where: { id: payload.data.stageId },
    data: { lockAt }
  });

  return NextResponse.json({
    stageId: updated.id,
    code: updated.code,
    lockAt: updated.lockAt
  });
}
