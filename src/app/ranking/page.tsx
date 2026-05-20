import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRanking } from "@/lib/ranking";

export default async function RankingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/ranking");

  const appConfig = await prisma.appConfig.findUnique({
    where: { singletonKey: "global" },
    include: { championTeam: true }
  });
  const ranking = await getRanking({ championTeamId: appConfig?.championTeamId ?? null });

  return (
    <main className="shell" style={{ maxWidth: 860 }}>
      <section className="brand">
        <h1 className="brand__title">Ranking</h1>
        <span className="brand__badge">{ranking.length} PARTICIPANTES</span>
      </section>

      <section className="card">
        <h2>Classificacao geral</h2>
        <p className="muted">
          Pontuacao calculada com base nos resultados oficiais ja lancados.
          {appConfig?.championTeam ? ` Campea oficial: ${appConfig.championTeam.name}.` : " Campea oficial ainda indefinida."}
        </p>
        <div className="form-grid">
          {ranking.length === 0 ? (
            <p className="message-error">Nenhum participante confirmado ainda.</p>
          ) : (
            ranking.map((participant, index) => (
              <article key={participant.participantId} className="field" style={{ display: "grid", gap: 6 }}>
                <strong>
                  {index + 1}. {participant.displayName}
                </strong>
                <span className="muted">
                  {participant.points} pontos - {participant.exactScoreHits} placares exatos
                  {participant.championHit ? " - bonus de campea aplicado" : ""}
                </span>
              </article>
            ))
          )}
        </div>
        <div className="cta-row">
          <Link className="button button--ghost" href="/painel">
            Voltar ao painel
          </Link>
          <Link className="button button--solid" href="/palpites-publicos">
            Ver palpites
          </Link>
        </div>
        <div className="cta-row">
          <Link className="button button--ghost" href="/premiacao">
            Premiacao
          </Link>
        </div>
      </section>
    </main>
  );
}
