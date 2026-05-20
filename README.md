# ScoppiaBET 2026

Aplicacao web para gestao do bolao da Copa do Mundo 2026.

## Status atual
Sprint 6 concluida: premiacao final, ranking, transparencia dos palpites e Bet do Bolao operacional.

## Roadmap
As decisoes de produto e o plano de sprints ate producao estao documentados em `docs/roadmap-producao.md`.

## Deploy e operacao
- Guia Supabase + Vercel: `docs/deploy-supabase-vercel.md`.
- Checklist do administrador: `docs/checklist-operacao-admin.md`.

## O que foi entregue na Sprint 0
- Estrutura base do app em Next.js + TypeScript.
- Configuracao de lint, typecheck e testes unitarios.
- Pipeline de CI no GitHub Actions.
- Modelagem inicial no Prisma para regras do bolao.
- Modulo de dominio com regras centrais do regulamento:
  - Pontuacao 10/5/0.
  - Bonus de 20 pontos para acerto da selecao campea.
  - Regra de maioria da Bet do Bolao + desempate por odd favorita.
  - Stake por fase (saldo/jogos restantes).
  - Distribuicao de premio 70/20/10.

## Como rodar localmente
1. Instalar dependencias:
```bash
npm install
```
2. Criar arquivo `.env` com base em `.env.example`.
3. Rodar app:
```bash
npm run dev
```

## Comandos uteis
```bash
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate:deploy
npm run db:seed
npm run build
```

## Funcionalidades ja implementadas na Sprint 1
- Cadastro de conta (`/cadastro`).
- Login por credenciais (`/login`).
- Inscricao do participante (`/inscricao`):
  - nome de exibicao no bolao;
  - selecao campea;
  - pagamento inicial como `PENDING` (pendente).
