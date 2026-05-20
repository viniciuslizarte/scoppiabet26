"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  stageId: string;
  lockAt: string;
};

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function EditarDeadlineFaseForm({ stageId, lockAt }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const rawLockAt = String(form.get("lockAt") ?? "");
    const parsedLockAt = new Date(rawLockAt);

    if (Number.isNaN(parsedLockAt.getTime())) {
      setError("Informe uma data valida.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/admin/stages/deadline", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stageId,
        lockAt: parsedLockAt.toISOString()
      })
    });

    setLoading(false);
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Erro ao atualizar prazo.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
      <input className="field" type="datetime-local" name="lockAt" defaultValue={toDatetimeLocal(lockAt)} required />
      <button className="button button--solid" type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar prazo"}
      </button>
      {error ? <p className="message-error">{error}</p> : null}
    </form>
  );
}
