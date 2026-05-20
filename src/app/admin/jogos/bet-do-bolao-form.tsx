"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  matchId: string;
  selectedOdd: string | null;
  stakeCents: number | null;
  settlementStatus: "PENDING" | "WON" | "LOST" | "VOID" | null;
};

export function BetDoBolaoForm({ matchId, selectedOdd, stakeCents, settlementStatus }: Props) {
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
    const stakeReais = Number(form.get("stakeReais"));
    const payload = {
      matchId,
      favoriteByOdds: String(form.get("favoriteByOdds")),
      selectedOdd: Number(form.get("selectedOdd")),
      stakeCents: Math.round(stakeReais * 100),
      settlementStatus: String(form.get("settlementStatus"))
    };

    const response = await fetch("/api/admin/bet-do-bolao", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Erro ao registrar Bet do Bolao.");
      return;
    }

    setSuccess("Bet do Bolao registrada.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
      <select className="field" name="favoriteByOdds" defaultValue="HOME">
        <option value="HOME">Favorita: mandante</option>
        <option value="DRAW">Favorita: empate</option>
        <option value="AWAY">Favorita: visitante</option>
      </select>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <input
          className="field"
          name="selectedOdd"
          type="number"
          step="0.001"
          min="1.001"
          placeholder="Odd"
          defaultValue={selectedOdd ?? ""}
          required
        />
        <input
          className="field"
          name="stakeReais"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Stake R$"
          defaultValue={stakeCents ? (stakeCents / 100).toFixed(2) : ""}
          required
        />
      </div>
      <select className="field" name="settlementStatus" defaultValue={settlementStatus ?? "PENDING"}>
        <option value="PENDING">Pendente</option>
        <option value="WON">Ganhou</option>
        <option value="LOST">Perdeu</option>
        <option value="VOID">Anulada</option>
      </select>
      <button className="button button--solid" type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Registrar Bet do Bolao"}
      </button>
      {error ? <p className="message-error">{error}</p> : null}
      {success ? <p className="message-ok">{success}</p> : null}
    </form>
  );
}
