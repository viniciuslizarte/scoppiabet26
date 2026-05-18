"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Team = {
  id: string;
  name: string;
};

type Props = {
  initialName: string;
  teams: Team[];
};

export function InscricaoForm({ initialName, teams }: Props) {
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
    const payload = {
      displayName: String(form.get("displayName") ?? ""),
      championTeamId: String(form.get("championTeamId") ?? "")
    };

    const response = await fetch("/api/inscricao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Falha ao salvar inscricao.");
      return;
    }

    setSuccess("Inscricao registrada. Status de pagamento: pendente.");
    setTimeout(() => {
      router.push("/painel");
    }, 900);
  }

  return (
    <form onSubmit={onSubmit} className="form-grid">
      <input className="field" name="displayName" defaultValue={initialName} placeholder="Nome no bolao" required />
      <select className="field" name="championTeamId" required defaultValue="">
        <option value="" disabled>
          Selecione a campea
        </option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <button className="button" type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Confirmar inscricao"}
      </button>
      {error ? <p className="message-error">{error}</p> : null}
      {success ? <p className="message-ok">{success} Redirecionando...</p> : null}
    </form>
  );
}
