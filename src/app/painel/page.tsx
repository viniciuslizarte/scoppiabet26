import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function PainelPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/painel");
  if (session.user.role === "ADMIN") redirect("/admin");

  const profile = await prisma.participantProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true, championTeam: true }
  });

  if (!profile) redirect("/inscricao");

  const groupStage = await prisma.stage.findUnique({
    where: { code: "GROUP" }
  });
  const [totalGroupMatches, filledGroupPredictions] = groupStage
    ? await Promise.all([
        prisma.match.count({ where: { stageId: groupStage.id } }),
        prisma.prediction.count({
          where: {
            participantId: profile.id,
            match: { stageId: groupStage.id }
          }
        })
      ])
    : [0, 0];

  return (
    <main className="shell" style={{ maxWidth: 760 }}>
      <section className="brand">
        <h1 className="brand__title">Painel do Participante</h1>
        <span className="brand__badge">{profile.paymentStatus === "CONFIRMED" ? "INSCRICAO CONFIRMADA" : "PENDENTE"}</span>
      </section>

      <section className="card">
        <h2>Inscricao concluida</h2>
        <p className="muted">Seu cadastro no bolao foi salvo com sucesso.</p>
        <div className="form-grid">
          <div className="field">Participante: {profile.displayName}</div>
          <div className="field">Selecao campea: {profile.championTeam?.name ?? "Nao definida"}</div>
          <div className="field">Status de pagamento: {profile.paymentStatus}</div>
          <div className="field">Valor pago: R$ {(profile.paidAmountCents / 100).toFixed(2)}</div>
          <div className="field">
            Palpites da fase de grupos: {filledGroupPredictions} de {totalGroupMatches}
          </div>
        </div>
        <div className="cta-row">
          <Link className="button button--solid" href="/palpites">
            Meus palpites
          </Link>
          <Link className="button button--ghost" href="/ranking">
            Ranking
          </Link>
        </div>
        <div className="cta-row">
          <Link className="button button--ghost" href="/palpites-publicos">
            Palpites do bolao
          </Link>
          <Link className="button button--ghost" href="/bet-do-bolao">
            Bet do bolao
          </Link>
        </div>
        <div className="cta-row">
          <Link className="button button--ghost" href="/premiacao">
            Premiacao
          </Link>
          <Link className="button button--ghost" href="/">
            Inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
