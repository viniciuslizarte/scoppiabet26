import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { EditarJogoForm } from "@/app/admin/jogos/editar-jogo-form";
import { ResultadoJogoForm } from "@/app/admin/jogos/resultado-jogo-form";
import { BetDoBolaoForm } from "@/app/admin/jogos/bet-do-bolao-form";

function formatKickoff(kickoffAt: Date | null) {
  if (!kickoffAt) return "Data a definir";
  return kickoffAt.toLocaleString("pt-BR");
}

export default async function AdminJogosPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/jogos");
  }

  if (!isAdminEmail(session.user.email)) {
    redirect("/login?callbackUrl=/admin/jogos&adminOnly=1");
  }

  const groups = await prisma.worldCupGroup.findMany({
    include: {
      teams: {
        orderBy: { groupPosition: "asc" }
      },
      matches: {
        include: {
          homeTeam: true,
          awayTeam: true,
          betDecision: true
        },
        orderBy: { matchNumber: "asc" }
      }
    },
    orderBy: { orderIndex: "asc" }
  });

  const totalTeams = groups.reduce((sum, group) => sum + group.teams.length, 0);
  const totalMatches = groups.reduce((sum, group) => sum + group.matches.length, 0);

  return (
    <main className="shell">
      <section className="brand">
        <h1 className="brand__title">Jogos da Copa</h1>
        <span className="brand__badge">{totalTeams} SELECOES</span>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2>Fase de grupos</h2>
        <p className="muted">
          Estrutura cadastrada com {groups.length} grupos e {totalMatches} jogos. Datas e estadios podem ser preenchidos
          quando a tabela operacional estiver pronta no admin.
        </p>
        <div className="cta-row">
          <Link className="button button--ghost" href="/admin">
            Voltar ao admin
          </Link>
        </div>
      </section>

      <div className="form-grid">
        {groups.map((group) => (
          <section className="card" key={group.id}>
            <h2>Grupo {group.code}</h2>
            <div className="form-grid">
              <div className="field">
                {group.teams.map((team) => (
                  <div key={team.id}>
                    {team.groupPosition}. {team.name} ({team.fifaCode})
                  </div>
                ))}
              </div>

              {group.matches.map((match) => (
                <article key={match.id} className="field" style={{ display: "grid", gap: 6 }}>
                  <strong>
                    Jogo {match.matchNumber}: {match.homeTeam.name} x {match.awayTeam.name}
                  </strong>
                  <span className="muted">{formatKickoff(match.kickoffAt)}</span>
                  <span className="muted">Estadio: {match.venue ?? "A definir"}</span>
                  {match.isFinished ? (
                    <span className="message-ok">
                      Resultado: {match.officialHomeGoals} x {match.officialAwayGoals}
                    </span>
                  ) : null}
                  <EditarJogoForm
                    matchId={match.id}
                    kickoffAt={match.kickoffAt?.toISOString() ?? null}
                    venue={match.venue}
                  />
                  <ResultadoJogoForm
                    matchId={match.id}
                    homeTeam={{ id: match.homeTeam.id, name: match.homeTeam.name }}
                    awayTeam={{ id: match.awayTeam.id, name: match.awayTeam.name }}
                    officialHomeGoals={match.officialHomeGoals}
                    officialAwayGoals={match.officialAwayGoals}
                    advancingTeamId={match.advancingTeamId}
                    isFinished={match.isFinished}
                  />
                  {match.betDecision ? (
                    <span className="message-ok">
                      Bet: {match.betDecision.selectedOption} - {match.betDecision.settlementStatus}
                    </span>
                  ) : null}
                  <BetDoBolaoForm
                    matchId={match.id}
                    selectedOdd={match.betDecision?.selectedOdd.toString() ?? null}
                    stakeCents={match.betDecision?.stakeCents ?? null}
                    settlementStatus={match.betDecision?.settlementStatus ?? null}
                  />
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
