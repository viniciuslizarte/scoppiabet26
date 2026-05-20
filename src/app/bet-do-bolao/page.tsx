import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getBetCurrentBalanceCents } from "@/lib/bet-do-bolao";
import { calculateInitialVariableFund } from "@/domain/rules";

const optionLabels = {
  HOME: "Mandante",
  DRAW: "Empate",
  AWAY: "Visitante"
};

const statusLabels = {
  PENDING: "Pendente",
  WON: "Ganhou",
  LOST: "Perdeu",
  VOID: "Anulada"
};

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export default async function BetDoBolaoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/bet-do-bolao");

  const [confirmedParticipants, currentBalanceCents, decisions] = await Promise.all([
    prisma.participantProfile.count({ where: { paymentStatus: "CONFIRMED" } }),
    getBetCurrentBalanceCents(),
    prisma.betDecision.findMany({
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }]
    })
  ]);
  const initialBalanceCents = calculateInitialVariableFund(confirmedParticipants);

  return (
    <main className="shell" style={{ maxWidth: 900 }}>
      <section className="brand">
        <h1 className="brand__title">Bet do Bolao</h1>
        <span className="brand__badge">{formatMoney(currentBalanceCents)}</span>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2>Banca coletiva</h2>
        <p className="muted">
          Saldo inicial: {formatMoney(initialBalanceCents)}. Saldo atual: {formatMoney(currentBalanceCents)}.
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

      <section className="card">
        <h2>Historico resumido</h2>
        <div className="form-grid">
          {decisions.length === 0 ? (
            <p className="message-error">Nenhuma Bet do Bolao registrada ainda.</p>
          ) : (
            decisions.map((decision) => (
              <article className="field" key={decision.id} style={{ display: "grid", gap: 6 }}>
                <strong>
                  Jogo {decision.match.matchNumber}: {decision.match.homeTeam.name} x {decision.match.awayTeam.name}
                </strong>
                <span className="muted">
                  Escolha coletiva: {optionLabels[decision.selectedOption]} ({decision.decisionType})
                </span>
                <span className="muted">Status: {statusLabels[decision.settlementStatus]}</span>
                {decision.balanceAfterCents !== null ? (
                  <span className="muted">Saldo apos jogo: {formatMoney(decision.balanceAfterCents)}</span>
                ) : (
                  <span className="muted">Aguardando resultado financeiro.</span>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
