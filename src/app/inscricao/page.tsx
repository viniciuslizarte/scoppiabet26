import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InscricaoForm } from "@/app/inscricao/form";

export default async function InscricaoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/inscricao");
  if (session.user.role === "ADMIN") redirect("/admin");

  const [teams, existing] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.participantProfile.findUnique({ where: { userId: session.user.id } })
  ]);

  if (existing?.championTeamId) {
    redirect("/painel");
  }

  return (
    <main className="shell" style={{ maxWidth: 720 }}>
      <section className="card">
        <h1>Inscricao no bolao</h1>
        <p className="muted">
          Taxa total: R$ 60,00. O status inicial do pagamento fica como pendente ate confirmacao da organizacao.
        </p>
        {teams.length === 0 ? (
          <p className="message-error">
            Nenhuma selecao cadastrada ainda. Execute o seed para habilitar a escolha da campea.
          </p>
        ) : (
          <InscricaoForm initialName={existing?.displayName ?? session.user.name ?? ""} teams={teams} />
        )}
      </section>
    </main>
  );
}
