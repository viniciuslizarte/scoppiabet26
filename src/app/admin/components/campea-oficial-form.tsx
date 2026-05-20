"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Team = {
  id: string;
  name: string;
};

type Props = {
  teams: Team[];
  championTeamId: string | null;
};

export function CampeaOficialForm({ teams, championTeamId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const form = new FormData(event.currentTarget);
    const championTeamIdValue = String(form.get("championTeamId") ?? "") || null;

    const response = await fetch("/api/admin/config/campea", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ championTeamId: championTeamIdValue })
    });

    setLoading(false);
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Erro ao salvar campea oficial.");
      return;
    }

    setSuccess("Campea oficial salva.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="form-grid">
      <select className="field" name="championTeamId" defaultValue={championTeamId ?? ""}>
        <option value="">Campea oficial ainda indefinida</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <button className="button button--solid" type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar campea oficial"}
      </button>
      {error ? <p className="message-error">{error}</p> : null}
      {success ? <p className="message-ok">{success}</p> : null}
    </form>
  );
}
