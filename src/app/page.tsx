import Link from "next/link";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const isLogged = Boolean(session?.user?.id);

  return (
    <main className="shell">
      <section className="brand">
        <h1 className="brand__title">ScoppiaBET 2026</h1>
        <span className="brand__badge">WORLD CUP EDITION</span>
      </section>

      <section className="hero card">
        <p className="hero__eyebrow">Bolao oficial 2026</p>
        <h2 className="hero__title">Sua estrategia vale premio real.</h2>
        <p className="muted hero__text">
          Placar exato, ranking ao vivo, bonus de selecao campea e premiacao final com regra transparente.
        </p>

        <div className="cta-row">
          {!isLogged ? (
            <>
              <Link href="/login" className="button button--ghost">
                Entrar
              </Link>
              <Link href="/cadastro" className="button button--solid">
                Criar conta
              </Link>
            </>
          ) : isAdmin ? (
            <Link href="/admin" className="button button--solid">
              Acessar painel admin
            </Link>
          ) : (
            <Link href="/inscricao" className="button button--solid">
              Participar do bolao
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
