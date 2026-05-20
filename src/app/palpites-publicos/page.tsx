import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStageLocked } from "@/domain/rules";

export default async function PalpitesPublicosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/palpites-publicos");

  const groupStage = await prisma.stage.findUnique({
    where: { code: "GROUP" }
  });

  if (!groupStage) {
    return (
      <main className="shell" style={{ maxWidth: 760 }}>
        <section className="card">
          <h1>Palpites</h1>
          <p className="message-error">A fase de grupos ainda nao foi cadastrada.</p>
        </section>
      </main>
    );
  }

  const [participants, matches] = await Promise.all([
    prisma.participantProfile.findMany({
      where: { paymentStatus: "CONFIRMED" },
      include: {
        predictions: {
          where: { match: { stageId: groupStage.id } },
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true
              }
            }
          },
          orderBy: { match: { matchNumber: "asc" } }
        }
      },
      orderBy: { displayName: "asc" }
    }),
    prisma.match.findMany({
      where: { stageId: groupStage.id },
      orderBy: { matchNumber: "asc" }
    })
  ]);

  const totalMatches = matches.length;
  const locked = isStageLocked({ lockAt: groupStage.lockAt });

  return (
    <main className="shell">
      <section className="brand">
        <h1 className="brand__title">Palpites do Bolao</h1>
        <span className="brand__badge">{locked ? "PALPITES ABERTOS" : "EM SIGILO"}</span>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2>Transparencia</h2>
        <p className="muted">
          Antes do prazo, apenas o progresso fica visivel. Depois do prazo, todos os palpites da fase sao liberados.
          Prazo: {groupStage.lockAt.toLocaleString("pt-BR")}.
        </p>
        <div className="cta-row">
          <Link className="button button--ghost" href="/painel">
            Voltar ao painel
          </Link>
          <Link className="button button--solid" href="/ranking">
            Ranking
          </Link>
        </div>
      </section>

      <div className="form-grid">
        {participants.map((participant) => (
          <section className="card" key={participant.id}>
            <h2>{participant.displayName}</h2>
            <p className="muted">
              Progresso: {participant.predictions.length} de {totalMatches} jogos
            </p>
            {locked ? (
              <div className="form-grid">
                {participant.predictions.map((prediction) => (
                  <article className="field" key={prediction.id} style={{ display: "grid", gap: 6 }}>
                    <strong>
                      Jogo {prediction.match.matchNumber}: {prediction.match.homeTeam.name} x{" "}
                      {prediction.match.awayTeam.name}
                    </strong>
                    <span className="muted">
                      Palpite: {prediction.predictedHomeGoals} x {prediction.predictedAwayGoals}
                    </span>
                    <span className="muted">Pontos: {prediction.pointsAwarded}</span>
                  </article>
                ))}
              </div>
            ) : (
              <p className="message-ok">Placares ocultos ate o encerramento do prazo.</p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
