# ADR-001 - Fundacao Tecnica

## Contexto
Precisamos de uma base confiavel para evoluir um bolao com regras financeiras e de classificacao, com baixo retrabalho e facilidade de manutencao.

## Decisao
- Plataforma web com Next.js + TypeScript.
- Regras centrais no dominio (`src/domain`) com testes unitarios.
- Persistencia em PostgreSQL com Prisma.
- Pipeline minimo de qualidade: lint + typecheck + testes no CI.

## Consequencias
- Menor risco de regressao nas regras de negocio.
- Evolucao mais rapida das proximas sprints com padrao unico.
- Dependencia de setup local de Node e banco para desenvolvimento.
