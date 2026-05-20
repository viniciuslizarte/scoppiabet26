"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type MatchPrediction = {
  matchId: string;
  matchNumber: number | null;
  homeTeamName: string;
  awayTeamName: string;
  predictedHomeGoals: number | null;
  predictedAwayGoals: number | null;
};

type MatchGroup = {
  code: string;
  matches: MatchPrediction[];
};

type Props = {
  groups: MatchGroup[];
  canEdit: boolean;
};

type ScoreState = Record<string, { home: string; away: string }>;

function buildInitialScores(groups: MatchGroup[]): ScoreState {
  return Object.fromEntries(
    groups.flatMap((group) =>
      group.matches.map((match) => [
        match.matchId,
        {
          home: match.predictedHomeGoals?.toString() ?? "",
          away: match.predictedAwayGoals?.toString() ?? ""
        }
      ])
    )
  );
}

export function PalpitesForm({ groups, canEdit }: Props) {
  const router = useRouter();
  const [scores, setScores] = useState<ScoreState>(() => buildInitialScores(groups));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateScore(matchId: string, side: "home" | "away", value: string) {
    setScores((current) => ({
      ...current,
      [matchId]: {
        ...current[matchId],
        [side]: value
      }
    }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const predictions = [];
    for (const [matchId, score] of Object.entries(scores)) {
      const hasHome = score.home.trim() !== "";
      const hasAway = score.away.trim() !== "";

      if (!hasHome && !hasAway) continue;
      if (!hasHome || !hasAway) {
        setError("Preencha os dois placares do jogo ou deixe os dois campos vazios.");
        return;
      }

      const predictedHomeGoals = Number(score.home);
      const predictedAwayGoals = Number(score.away);
      if (!Number.isInteger(predictedHomeGoals) || !Number.isInteger(predictedAwayGoals)) {
        setError("Use apenas numeros inteiros nos placares.");
        return;
      }

      predictions.push({
        matchId,
        predictedHomeGoals,
        predictedAwayGoals
      });
    }

    setLoading(true);
    const response = await fetch("/api/palpites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ predictions })
    });

    setLoading(false);
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Falha ao salvar palpites.");
      return;
    }

    const data = (await response.json()) as { saved: number };
    setSuccess(`${data.saved} palpites salvos.`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="form-grid">
      {groups.map((group) => (
        <section className="card" key={group.code}>
          <h2>Grupo {group.code}</h2>
          <div className="form-grid">
            {group.matches.map((match) => (
              <article className="field" key={match.matchId} style={{ display: "grid", gap: 10 }}>
                <strong>
                  Jogo {match.matchNumber}: {match.homeTeamName} x {match.awayTeamName}
                </strong>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span>{match.homeTeamName}</span>
                    <input
                      className="field"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={99}
                      value={scores[match.matchId]?.home ?? ""}
                      disabled={!canEdit || loading}
                      onChange={(event) => updateScore(match.matchId, "home", event.target.value)}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span>{match.awayTeamName}</span>
                    <input
                      className="field"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={99}
                      value={scores[match.matchId]?.away ?? ""}
                      disabled={!canEdit || loading}
                      onChange={(event) => updateScore(match.matchId, "away", event.target.value)}
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      {canEdit ? (
        <button className="button button--solid" type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar palpites"}
        </button>
      ) : (
        <p className="message-error">O prazo desta fase encerrou. Os palpites estao bloqueados.</p>
      )}
      {error ? <p className="message-error">{error}</p> : null}
      {success ? <p className="message-ok">{success}</p> : null}
    </form>
  );
}
