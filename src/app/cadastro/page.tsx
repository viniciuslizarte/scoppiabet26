"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CadastroPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? "")
    };

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Falha ao cadastrar.");
      return;
    }

    router.push("/login");
  }

  return (
    <main className="shell" style={{ maxWidth: 640 }}>
      <section className="card">
        <h1>Criar conta</h1>
        <p className="muted">Acesso rapido para entrar no bolao e registrar sua inscricao.</p>
        <form onSubmit={onSubmit} className="form-grid">
          <input className="field" name="name" placeholder="Nome completo" required />
          <input className="field" name="email" type="email" placeholder="Email" required />
          <input
            className="field"
            name="password"
            type="password"
            placeholder="Senha (min. 6)"
            minLength={6}
            required
          />
          <button className="button" type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
        {error ? <p className="message-error">{error}</p> : null}
      </section>
    </main>
  );
}
