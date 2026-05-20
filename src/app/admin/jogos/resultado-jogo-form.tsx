"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Team = {
  id: string;
  name: string;
};

type Props = {
  matchId: string;
  homeTeam: Team;
  awayTeam: Team;
  officialHomeGoals: number | null;
  officialAwayGoals: number | null;
  advancingTeamId: string | null;
  isFinished: boolean;
};

export function ResultadoJogoForm({
  matchId,
  homeTeam,
  awayTeam,
  officialHomeGoals,
  officialAwayGoals,
  advancingTeamId,
  isFinished
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      matchId,
      officialHomeGoals: Number(form.get("officialHomeGoals")),
      officialAwayGoals: Number(form.get("officialAwayGoals")),
      advancingTeamId: String(form.get("advancingTeamId") ?? "") || null
    };

    const response = await fetch("/api/admin/matches/result", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Erro ao salvar resultado.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <input
          className="field"
          type="number"
          name="officialHomeGoals"
          min={0}
          max={99}
          defaultValue={officialHomeGoals ?? ""}
          placeholder={homeTeam.name}
          required
        />
        <input
          className="field"
          type="number"
          name="officialAwayGoals"
          min={0}
          max={99}
          defaultValue={officialAwayGoals ?? ""}
          placeholder={awayTeam.name}
          required
        />
      </div>
      <select className="field" name="advancingTeamId" defaultValue={advancingTeamId ?? ""}>
        <option value="">Classificado apenas se empate no mata-mata</option>
        <option value={homeTeam.id}>{homeTeam.name}</option>
        <option value={awayTeam.id}>{awayTeam.name}</option>
      </select>
      <button className="button button--solid" type="submit" disabled={loading}>
        {loading ? "Salvando..." : isFinished ? "Atualizar resultado" : "Salvar resultado"}
      </button>
      {error ? <p className="message-error">{error}</p> : null}
    </form>
  );
}
