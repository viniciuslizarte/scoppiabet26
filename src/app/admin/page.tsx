import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { ConfirmarPagamentoButton } from "@/app/admin/components/confirmar-pagamento-button";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isAdminEmail(session.user.email)) {
    redirect("/login?callbackUrl=/admin&adminOnly=1");
  }

  const participants = await prisma.participantProfile.findMany({
    include: { user: true, championTeam: true },
    orderBy: { createdAt: "desc" }
  });

  const pendentes = participants.filter((p) => p.paymentStatus === "PENDING");
  const confirmados = participants.filter((p) => p.paymentStatus === "CONFIRMED");

  return (
    <main className="shell">
      <section className="brand">
        <h1 className="brand__title">Painel Admin</h1>
        <span className="brand__badge">GESTAO DE PAGAMENTOS</span>
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
