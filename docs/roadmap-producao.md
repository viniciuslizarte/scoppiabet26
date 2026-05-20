# Roadmap de Producao - ScoppiaBET 2026

## Decisoes de Produto Fechadas

- Participantes: 17 participantes pagantes + 1 administrador.
- Administrador: gerencia o bolao, mas nao participa da classificacao.
- Taxa de inscricao: R$ 60,00 por participante.
- Fundo fixo: R$ 50,00 por participante.
- Fundo variavel: R$ 10,00 por participante para a Bet do Bolao.
- Pagamento: confirmacao manual pelo administrador, sem upload de comprovante.
- Palpites: podem ser editados livremente ate o prazo da fase.
- Travamento: depois do prazo, os palpites ficam imutaveis.
- Prazo recomendado: 24 horas antes do primeiro jogo de cada fase.
- Alternativa operacional: permitir que o administrador ajuste manualmente o prazo de cada fase.
- Eliminatorias: palpites valem apenas para o placar no tempo normal, excluindo prorrogacao e penaltis.
- Penaltis: nao entram na pontuacao 10/5/0. A classificacao da selecao nos penaltis deve ser usada apenas para montar a proxima fase.
- Bet do Bolao: resultados e saldo final ficam visiveis aos participantes; apostas reais/detalhes operacionais ficam restritos ao administrador.
- Objetivo de entrega: MVP robusto para grupo fechado, com caminho claro para producao em Supabase + Vercel.

## Recomendacao Para Eliminatorias

Como os palpites valem apenas os 90 minutos, jogos eliminatorios podem terminar empatados para fins de pontuacao do bolao.

Exemplo:

- Palpite: Brasil 1 x 1 Franca.
- Resultado aos 90 minutos: Brasil 1 x 1 Franca.
- Brasil vence nos penaltis.
- Pontuacao do palpite: 10 pontos, porque o placar de 90 minutos foi exato.
- Avanco de fase: Brasil deve seguir na chave, porque venceu nos penaltis no resultado oficial da Copa.

Isso separa duas coisas:

- pontuacao do participante, baseada nos 90 minutos;
- montagem da fase seguinte, baseada em quem avancou oficialmente.

## Sprint 1 - Base de Producao e Regras

Objetivo: deixar as regras centrais confiaveis e preparar o app para evolucao rapida.

Entregas:

- [x] Revisar regulamento dentro do app/documentacao.
- [x] Ajustar regras de eliminatorias para deixar explicito o uso dos 90 minutos.
- [x] Adicionar modelo de deadline por fase, com possibilidade de edicao pelo administrador.
- [x] Criar testes para bloqueio de edicao depois do prazo.
- [x] Revisar autenticacao e permissoes de administrador.
- [x] Preparar banco para Supabase com migrations Prisma.

Resultado esperado:

- Fundacao tecnica pronta para cadastro real dos participantes e expansao dos fluxos.

## Sprint 2 - Calendario Oficial e Estrutura da Copa

Objetivo: cadastrar a estrutura operacional da Copa 2026.

Entregas:

- [x] Cadastrar 48 selecoes.
- [x] Cadastrar 12 grupos.
- [x] Cadastrar fases: grupos, 32-avos, oitavas, quartas, semifinais e final.
- [x] Cadastrar os confrontos da fase de grupos.
- [x] Criar painel admin para listar/editar jogos.
- [x] Criar campos para resultado de 90 minutos e selecao classificada.

Resultado esperado:

- App entende a estrutura da Copa e consegue abrir palpites por fase.

## Sprint 3 - Fluxo de Palpites Mobile

Objetivo: permitir que participantes preencham e editem palpites com boa experiencia mobile.

Entregas:

- [x] Tela de palpites por fase.
- [x] Inputs de gols por jogo.
- [x] Botao de salvar palpites.
- [x] Indicador de fase aberta/fechada.
- [x] Bloqueio de edicao apos deadline.
- [x] Validacoes: placar numerico, nao negativo e fase existente.
- [x] Painel do participante com progresso dos palpites.

Resultado esperado:

- Participantes conseguem registrar todos os palpites da fase atual sem depender do administrador.

## Sprint 4 - Ranking e Pontuacao

Objetivo: transformar resultados oficiais em classificacao transparente.

Entregas:

- [x] Antes do prazo, tela publica mostra apenas progresso de preenchimento por participante.
- [x] Depois do prazo, todos os participantes veem todos os palpites da fase.
- [x] Admin lanca resultados dos jogos.
- [x] Sistema calcula 10/5/0 automaticamente.
- [x] Sistema calcula placares exatos.
- [x] Sistema aplica bonus de campeao ao final.
- [x] Ranking publico dos participantes.
- [x] Criterios de desempate:
  - acerto da selecao campea;
  - maior numero de placares exatos;
  - empate persistente marcado para divisao/sorteio manual.

Resultado esperado:

- Classificacao confiavel, auditavel e facil de entender.

## Sprint 5 - Bet do Bolao

Objetivo: controlar a banca variavel com transparencia suficiente e operacao simples.

Entregas:

- [x] Calculo dos votos por jogo a partir dos palpites.
- [x] Definicao da escolha da maioria.
- [x] Desempate por favorita da casa em caso de empate de votos.
- [x] Admin registra odd, stake e resultado financeiro.
- [x] Sistema calcula saldo da banca.
- [x] Visao publica: saldo, resultado agregado e historico resumido.
- [x] Visao admin: detalhes de aposta, odd, stake e resultado.

Resultado esperado:

- Fundo variavel controlado sem expor detalhes sensiveis desnecessarios.

## Sprint 6 - Premiacoes e Fechamento

Objetivo: calcular o valor final e preparar encerramento do bolao.

Entregas:

- [x] Calculo do fundo fixo com base nos pagamentos confirmados.
- [x] Soma do fundo fixo + saldo final da Bet do Bolao.
- [x] Distribuicao 70% / 20% / 10%.
- [x] Tela final de premiacao.
- [x] Tratamento de empates e divisao/sorteio manual.

Resultado esperado:

- Encerramento do bolao com valores claros para todos.

## Sprint 7 - Supabase, Vercel e Hardening

Objetivo: colocar em producao com seguranca e estabilidade.

Entregas:

- [ ] Criar projeto Supabase.
- [x] Configurar documentacao para banco Postgres e connection pooling.
- [x] Configurar exemplo de variaveis de ambiente na Vercel.
- [x] Preparar comando de migrations em producao.
- [ ] Configurar dominio, se houver.
- [x] Criar checklist de validacao em ambiente de preview.
- [x] Revisar logs, erros, permissoes e backups.
- [x] Criar checklist de operacao para o administrador.

Resultado esperado:

- App publicado, testado e pronto para uso do grupo.

## Proxima Prioridade Recomendada

A proxima entrega mais importante e a Sprint 7, com foco em:

- configurar Supabase;
- configurar Vercel;
- rodar migrations e seed em producao;
- validar o fluxo completo ponta a ponta;
- preparar checklist operacional do administrador.

Depois disso, o app entra em fase de hardening e ajuste fino para uso real.
