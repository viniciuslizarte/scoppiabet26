"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  participantId: string;
};

export function ConfirmarPagamentoButton({ participantId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onConfirm() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/confirmar-pagamento", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, paidAmountCents: 6000 })
    });

    setLoading(false);
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Erro ao confirmar.");
      return;
    }

    router.refresh();
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button className="button button--solid" onClick={onConfirm} disabled={loading}>
        {loading ? "Confirmando..." : "Confirmar pagamento"}
      </button>
      {error ? <p className="message-error">{error}</p> : null}
    </div>
  );
}
