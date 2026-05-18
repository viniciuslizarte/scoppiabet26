import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

const schema = z.object({
  participantId: z.string().min(1),
  paidAmountCents: z.number().int().positive().default(6000)
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

  const updated = await prisma.participantProfile.update({
    where: { id: payload.data.participantId },
    data: {
      paymentStatus: "CONFIRMED",
      paidAmountCents: payload.data.paidAmountCents
    }
  });

  return NextResponse.json({
    participantId: updated.id,
    paymentStatus: updated.paymentStatus,
    paidAmountCents: updated.paidAmountCents
  });
}
