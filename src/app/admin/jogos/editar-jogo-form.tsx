"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  matchId: string;
  kickoffAt: string | null;
  venue: string | null;
};

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function EditarJogoForm({ matchId, kickoffAt, venue }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const rawKickoffAt = String(form.get("kickoffAt") ?? "");
    const rawVenue = String(form.get("venue") ?? "").trim();
    const parsedKickoffAt = rawKickoffAt ? new Date(rawKickoffAt) : null;

    if (parsedKickoffAt && Number.isNaN(parsedKickoffAt.getTime())) {
      setError("Informe uma data valida.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/admin/matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        kickoffAt: parsedKickoffAt?.toISOString() ?? null,
        venue: rawVenue || null
      })
    });

    setLoading(false);
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Erro ao atualizar jogo.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
      <input className="field" type="datetime-local" name="kickoffAt" defaultValue={toDatetimeLocal(kickoffAt)} />
      <input className="field" name="venue" defaultValue={venue ?? ""} placeholder="Estadio" />
      <button className="button button--solid" type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar jogo"}
      </button>
      {error ? <p className="message-error">{error}</p> : null}
    </form>
  );
}
