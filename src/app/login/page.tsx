"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const adminOnly = params.get("adminOnly") === "1";

  useEffect(() => {
    if (adminOnly) {
      void signOut({ redirect: false });
    }
  }, [adminOnly]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    setLoading(false);
    if (!result || result.error) {
      setError("Email ou senha invalidos.");
      return;
    }

    const callbackUrl = params.get("callbackUrl");
    if (callbackUrl) {
      router.push(callbackUrl);
      return;
    }

    const sessionResponse = await fetch("/api/auth/session");
    const session = (await sessionResponse.json()) as { user?: { role?: string } };
    router.push(session?.user?.role === "ADMIN" ? "/admin" : "/inscricao");
  }

  return (
    <main className="shell" style={{ maxWidth: 640 }}>
      <section className="card">
        <h1>Entrar</h1>
        {adminOnly ? (
          <p className="message-error">Area administrativa: entre com o email de administrador.</p>
        ) : null}
        <p className="muted">Use sua conta para continuar no fluxo de inscricao e palpites.</p>
        <form onSubmit={onSubmit} className="form-grid">
          <input className="field" name="email" type="email" placeholder="Email" required />
          <input className="field" name="password" type="password" placeholder="Senha" required />
          <button className="button" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        {error ? <p className="message-error">{error}</p> : null}
      </section>
    </main>
  );
}
