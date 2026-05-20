# Deploy - Supabase + Vercel

## Referencias Oficiais

- Supabase + Prisma: https://supabase.com/docs/guides/database/prisma
- Prisma em deploy serverless/Vercel: https://www.prisma.io/docs/guides/deployment/deploying-to-vercel
- Vercel Environment Variables: https://vercel.com/docs/environment-variables

## Visao Geral

O app usa:

- Next.js na Vercel.
- PostgreSQL no Supabase.
- Prisma para schema, migrations e queries.
- NextAuth com credenciais.

Para producao, use:

- `DATABASE_URL`: connection string com pooler do Supabase para o app.
- `DIRECT_URL`: connection string direta para migrations Prisma.

## 1. Criar Projeto no Supabase

1. Acesse o Supabase.
2. Crie um novo projeto.
3. Guarde:
   - Project Reference;
   - senha do banco;
   - regiao do projeto.
4. Em Database > Connection string, copie:
   - pooler/transaction mode para `DATABASE_URL`;
   - direct connection para `DIRECT_URL`.

## 2. Configurar Variaveis na Vercel

No projeto da Vercel, cadastre:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `ADMIN_EMAIL`

Use `.env.production.example` como referencia.

Para gerar um segredo forte:

```bash
openssl rand -base64 32
```

Use o mesmo valor em `AUTH_SECRET` e `NEXTAUTH_SECRET`.

## 3. Rodar Migrations

Antes do primeiro uso em producao, rode:

```bash
npm run prisma:migrate:deploy
```

Em seguida, rode o seed:

```bash
npm run db:seed
```

O seed cria:

- fases;
- grupos;
- selecoes;
- jogos da fase de grupos;
- configuracao global do app.

## 4. Deploy na Vercel

O projeto tem `vercel.json` com:

```json
{
  "buildCommand": "npm run prisma:generate && npm run build"
}
```

Isso garante que o Prisma Client seja gerado antes do build.

## 5. Checklist de Validacao em Preview

1. Abrir a URL de preview.
2. Criar conta admin com o email definido em `ADMIN_EMAIL`.
3. Entrar no painel admin.
4. Confirmar que fases aparecem em "Prazos por fase".
5. Confirmar que jogos aparecem em `/admin/jogos`.
6. Criar uma conta participante.
7. Fazer inscricao e escolher campea.
8. Confirmar pagamento no admin.
9. Preencher palpites.
10. Verificar progresso no painel.
11. Ajustar deadline para testar bloqueio.
12. Conferir tela de palpites publicos.
13. Lancar resultado de jogo.
14. Conferir ranking.
15. Registrar Bet do Bolao.
16. Conferir pagina publica da Bet.
17. Definir selecao campea no admin.
18. Conferir bonus no ranking e premiacao.

## 6. Pontos de Atencao

- Nunca rode `prisma migrate dev` em producao.
- Em producao, use `prisma migrate deploy`.
- Nao exponha detalhes sensiveis da casa de aposta fora do painel admin.
- Mantenha `ADMIN_EMAIL` atualizado antes de criar a conta admin.
- Ao alterar variaveis de ambiente na Vercel, faca novo deploy.

## Pendencias Que Dependem de Credenciais

Estas etapas precisam ser feitas com acesso as suas contas:

- Criar o projeto real no Supabase.
- Copiar `DATABASE_URL` e `DIRECT_URL` reais.
- Criar/importar o projeto na Vercel.
- Configurar variaveis de ambiente na Vercel.
- Rodar `npm run prisma:migrate:deploy` contra o banco real.
- Rodar `npm run db:seed` contra o banco real.
- Validar a URL de preview/production com usuarios reais.
- Configurar dominio personalizado, se houver.
