import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditPrediction } from "@/domain/rules";
import { PalpitesForm } from "@/app/palpites/form";

export default async function PalpitesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/palpites");
  if (session.user.role === "ADMIN") redirect("/admin");

  const profile = await prisma.participantProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!profile) redirect("/inscricao");

  const groupStage = await prisma.stage.findUnique({
    where: { code: "GROUP" }
  });

  if (!groupStage) {
    return (
      <main className="shell" style={{ maxWidth: 760 }}>
        <section className="card">
          <h1>Meus palpites</h1>
          <p className="message-error">A fase de grupos ainda nao foi cadastrada.</p>
        </section>
      </main>
    );
  }

  const groups = await prisma.worldCupGroup.findMany({
    include: {
      matches: {
        where: { stageId: groupStage.id },
        include: {
          homeTeam: true,
          awayTeam: true,
          predictions: {
            where: { participantId: profile.id }
          }
        },
        orderBy: { matchNumber: "asc" }
      }
    },
    orderBy: { orderIndex: "asc" }
  });

  const totalMatches = groups.reduce((sum, group) => sum + group.matches.length, 0);
  const filledMatches = groups.reduce(
    (sum, group) => sum + group.matches.filter((match) => match.predictions.length > 0).length,
    0
  );
  const canEdit = canEditPrediction({ lockAt: groupStage.lockAt });

  const formGroups = groups.map((group) => ({
    code: group.code,
    matches: group.matches.map((match) => {
      const prediction = match.predictions[0];
      return {
        matchId: match.id,
        matchNumber: match.matchNumber,
        homeTeamName: match.homeTeam.name,
        awayTeamName: match.awayTeam.name,
        predictedHomeGoals: prediction?.predictedHomeGoals ?? null,
        predictedAwayGoals: prediction?.predictedAwayGoals ?? null
      };
    })
  }));

  return (
    <main className="shell">
      <section className="brand">
        <h1 className="brand__title">Meus Palpites</h1>
        <span className="brand__badge">{canEdit ? "FASE ABERTA" : "BLOQUEADO"}</span>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2>Fase de grupos</h2>
        <p className="muted">
          Progresso: {filledMatches} de {totalMatches} jogos preenchidos. Prazo:{" "}
          {groupStage.lockAt.toLocaleString("pt-BR")}.
        </p>
        <div className="cta-row">
          <Link className="button button--ghost" href="/painel">
            Voltar ao painel
          </Link>
        </div>
      </section>

      {totalMatches === 0 ? (
        <section className="card">
          <p className="message-error">Nenhum jogo cadastrado para esta fase.</p>
        </section>
      ) : (
        <PalpitesForm groups={formGroups} canEdit={canEdit} />
      )}
    </main>
  );
}
