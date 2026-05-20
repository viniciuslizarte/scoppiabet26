import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { ConfirmarPagamentoButton } from "@/app/admin/components/confirmar-pagamento-button";
import { EditarDeadlineFaseForm } from "@/app/admin/components/editar-deadline-fase-form";
import { CampeaOficialForm } from "@/app/admin/components/campea-oficial-form";

const stageLabels = {
  GROUP: "Fase de grupos",
  R32: "32-avos",
  R16: "Oitavas",
  QF: "Quartas",
  SF: "Semifinais",
  FINAL: "Final"
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isAdminEmail(session.user.email)) {
    redirect("/login?callbackUrl=/admin&adminOnly=1");
  }

  const [participants, stages, teams, appConfig] = await Promise.all([
    prisma.participantProfile.findMany({
      include: { user: true, championTeam: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.stage.findMany({
      orderBy: { orderIndex: "asc" }
    }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.appConfig.findUnique({ where: { singletonKey: "global" } })
  ]);

  const pendentes = participants.filter((p) => p.paymentStatus === "PENDING");
  const confirmados = participants.filter((p) => p.paymentStatus === "CONFIRMED");

  return (
    <main className="shell">
      <section className="brand">
        <h1 className="brand__title">Painel Admin</h1>
        <span className="brand__badge">GESTAO DO BOLAO</span>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2>Estrutura da Copa</h2>
        <p className="muted">Consulte grupos, selecoes e jogos cadastrados para a fase de grupos.</p>
        <div className="cta-row">
          <a className="button button--solid" href="/admin/jogos">
            Ver jogos
          </a>
          <a className="button button--ghost" href="/painel">
            Area do participante
          </a>
        </div>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2>Selecao campea</h2>
        <p className="muted">
          Quando a campea oficial for definida, o ranking soma automaticamente 20 pontos para quem escolheu essa selecao.
        </p>
        <CampeaOficialForm teams={teams} championTeamId={appConfig?.championTeamId ?? null} />
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2>Prazos por fase</h2>
        <p className="muted">
          Participantes podem editar palpites ate o prazo da fase. Depois disso, os palpites ficam bloqueados.
        </p>
        {stages.length === 0 ? (
          <p className="message-error">Nenhuma fase cadastrada ainda. Execute o seed para criar os prazos iniciais.</p>
        ) : (
          <div className="form-grid">
            {stages.map((stage) => (
              <article key={stage.id} className="field" style={{ display: "grid", gap: 10 }}>
                <strong>{stageLabels[stage.code]}</strong>
                <span className="muted">Prazo atual: {stage.lockAt.toLocaleString("pt-BR")}</span>
                <EditarDeadlineFaseForm stageId={stage.id} lockAt={stage.lockAt.toISOString()} />
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2>Pendentes ({pendentes.length})</h2>
        {pendentes.length === 0 ? (
          <p className="muted">Sem pagamentos pendentes.</p>
        ) : (
          <div className="form-grid">
            {pendentes.map((item) => (
              <article key={item.id} className="field" style={{ display: "grid", gap: 10 }}>
                <strong>{item.displayName}</strong>
                <span className="muted">{item.user.email}</span>
                <span className="muted">Campea: {item.championTeam?.name ?? "Nao definida"}</span>
                <ConfirmarPagamentoButton participantId={item.id} />
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Confirmados ({confirmados.length})</h2>
        {confirmados.length === 0 ? (
          <p className="muted">Nenhum pagamento confirmado ainda.</p>
        ) : (
          <div className="form-grid">
            {confirmados.map((item) => (
              <article key={item.id} className="field" style={{ display: "grid", gap: 6 }}>
                <strong>{item.displayName}</strong>
                <span className="muted">
                  {item.user.email} - R$ {(item.paidAmountCents / 100).toFixed(2)}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
