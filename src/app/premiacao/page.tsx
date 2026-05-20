import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPremiacaoResumo } from "@/lib/premiacao";

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function hasPrizeTie(ranking: Awaited<ReturnType<typeof getPremiacaoResumo>>["ranking"]) {
  const topThree = ranking.slice(0, 3);
  if (topThree.length < 2) return false;
  return topThree.some((participant, index) => {
    const next = topThree[index + 1];
    return Boolean(next && participant.points === next.points && participant.exactScoreHits === next.exactScoreHits);
  });
}

export default async function PremiacaoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/premiacao");

  const resumo = await getPremiacaoResumo();
  const podium = resumo.ranking.slice(0, 3);
  const prizeTie = hasPrizeTie(resumo.ranking);

  return (
    <main className="shell" style={{ maxWidth: 900 }}>
      <section className="brand">
        <h1 className="brand__title">Premiacao</h1>
        <span className="brand__badge">{formatMoney(resumo.totalPrizeCents)}</span>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2>Montante final</h2>
        <div className="form-grid">
          <div className="field">Participantes confirmados: {resumo.confirmedParticipants}</div>
          <div className="field">Campea oficial: {resumo.championTeam?.name ?? "A definir"}</div>
          <div className="field">Fundo fixo: {formatMoney(resumo.fixedFundCents)}</div>
          <div className="field">Saldo da Bet do Bolao: {formatMoney(resumo.betBalanceCents)}</div>
          <div className="field">Total para premiacao: {formatMoney(resumo.totalPrizeCents)}</div>
        </div>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2>Distribuicao 70/20/10</h2>
        <div className="form-grid">
          <article className="field" style={{ display: "grid", gap: 6 }}>
            <strong>1º colocado: {formatMoney(resumo.distribution.first)}</strong>
            <span className="muted">
              {podium[0]?.displayName ?? "A definir"}
              {podium[0]?.championHit ? " - bonus de campea aplicado" : ""}
            </span>
          </article>
          <article className="field" style={{ display: "grid", gap: 6 }}>
            <strong>2º colocado: {formatMoney(resumo.distribution.second)}</strong>
            <span className="muted">
              {podium[1]?.displayName ?? "A definir"}
              {podium[1]?.championHit ? " - bonus de campea aplicado" : ""}
            </span>
          </article>
          <article className="field" style={{ display: "grid", gap: 6 }}>
            <strong>3º colocado: {formatMoney(resumo.distribution.third)}</strong>
            <span className="muted">
              {podium[2]?.displayName ?? "A definir"}
              {podium[2]?.championHit ? " - bonus de campea aplicado" : ""}
            </span>
          </article>
        </div>
        {prizeTie ? (
          <p className="message-error">
            Existe empate dentro da faixa de premiacao. A organizacao deve aplicar o criterio final de divisao ou sorteio.
          </p>
        ) : null}
        <div className="cta-row">
          <Link className="button button--ghost" href="/painel">
            Voltar ao painel
          </Link>
          <Link className="button button--solid" href="/ranking">
            Ranking
          </Link>
        </div>
      </section>
    </main>
  );
}
