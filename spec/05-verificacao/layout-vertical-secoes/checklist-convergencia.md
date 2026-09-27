# Checklist de Convergência — Layout vertical das seções

Status: Revisão concluída — deploy não aprovado  
Data: 2026-09-24  
Commit revisado: working tree sem commit específico da feature

Spec relacionada: `spec/03-features/layout-vertical-secoes/spec.md`  
Plano relacionado: `spec/04-plano/layout-vertical-secoes/plano.md`  
Tarefas relacionadas: `spec/04-plano/layout-vertical-secoes/tarefas.md`

## Resumo da revisão

A comparação foi feita entre a Spec aprovada, o plano/tarefas, o código em
`src/app/features/portfolio/presentation/` e os testes Vitest.

A implementação atende estruturalmente aos dois requisitos funcionais: a página passou a
usar uma coluna e a ordem do DOM passou a ser “Sobre mim”, “Stack técnica” e depois as
demais seções. A suíte automatizada e o build passaram.

A convergência visual completa ainda não pode ser confirmada porque a automação de
navegador não está disponível neste ambiente. Também foi encontrada uma divergência visual
potencial: o seletor posicional `section:nth-child(2)` agora aplica o destaque vermelho à
“Stack técnica”, embora antes o destaque fosse aplicado à segunda seção, “Experiências”.
Isso precisa ser decidido ou corrigido antes da aprovação do deploy.

## Rastreio Spec ↔ Plano/Tarefas ↔ Código ↔ Testes

| Requisito | Código | Teste/evidência | Status |
|---|---|---|---|
| FR-001 — todas as seções em uma única coluna vertical | `portfolio-page.scss`: `.sections { grid-template-columns: minmax(0, 1fr) }`; em móvel, o layout continua em bloco | `portfolio-page.spec.ts` confirma as seções renderizadas; inspeção estática confirma a regra CSS; build passou | Parcialmente confirmado — falta validação visual no navegador em todos os tamanhos |
| FR-002 — “Sobre mim”, “Stack técnica” e depois as demais | `portfolio-page.ts`: `navigationItems()` monta Stack antes de Experiências; o template usa essa sequência | `portfolio-page.spec.ts` confirma a ordem dos IDs: `sobre-mim`, `stack-tecnica`, `experiencias`, `resultados-profissionais` | Confirmado |
| AC-001 — uma coluna e ordem correta | Composição e CSS correspondem ao critério | Testes automatizados confirmam a ordem; a disposição de coluna foi confirmada apenas por inspeção estática | Parcialmente confirmado |
| AC-002 — conteúdo excedente distribuído verticalmente | `section { min-width: 0; overflow-wrap: anywhere }` e remoção da borda lateral entre seções | Não há teste automatizado de layout/overflow nem evidência visual executada | Não confirmado completamente |
| Regressão de navegação e conteúdo | IDs e links existentes foram preservados; somente a ordem dos itens foi alterada | 71 testes aprovados, incluindo navegação, destinos ausentes, conteúdo, idioma e experiências | Confirmado para cobertura automatizada; visual pendente |

## Requisitos

- [x] Todo comportamento implementado corresponde a um requisito da Spec ou está
      explicitamente identificado como divergência nesta checklist.
  - A coluna única, a ordem das seções e a quebra vertical estão previstas na Spec.
  - A mudança do destaque vermelho por causa de `section:nth-child(2)` está registrada
    em “Divergências encontradas”.
- [ ] O critério de aceite reflete o comportamento final de verdade.
  - AC-001 está coberto estruturalmente e por teste de ordem, mas a coluna única ainda não
    foi confirmada visualmente no navegador.
  - AC-002 tem suporte estático em CSS, mas não teve teste visual com conteúdo extenso.
- [ ] A divergência visual do seletor `section:nth-child(2)` foi resolvida ou aprovada
      conscientemente por Marcos.

## Arquitetura

- [x] A estrutura de pastas/módulos respeita `spec/02-arquitetura/ARQUITETURA.md`.
  - As alterações estão restritas a `src/app/features/portfolio/presentation/`.
  - Não foi criada uma feature, camada ou pasta global nova.
- [x] Nenhum limite arquitetural foi cruzado.
  - Não houve alteração em Supabase, PostgreSQL, Storage, Auth, migrations ou área
    administrativa.
- [x] O layout interno de cards de experiências/resultados não foi alterado como se fosse
      o layout das seções.
  - A feature altera a disposição das seções públicas; os grids internos permanecem
    existentes e fora do requisito de coluna única das seções.

## Dados

- [x] Migration testada, se houve mudança de schema — não aplicável; não houve mudança de
      schema, banco, Storage ou Supabase.
- [x] Não há dados externos para rollback nesta feature.
- [ ] Rollback operacional da entrega não foi confirmado por commit ou ambiente de deploy.

## Testes

- [ ] Requisitos de prioridade alta têm verificação completa.
  - O plano não define IDs formais de prioridade. Para esta revisão, FR-001/FR-002 e
    AC-001/AC-002 foram tratados como requisitos prioritários.
  - FR-002 tem teste automatizado de ordem.
  - FR-001 e AC-002 não têm validação visual executada em navegador.
- [x] Regressão automatizada checada.
  - 7 arquivos de teste passaram, totalizando 71 testes.
  - A cobertura inclui navegação, destino ausente, idioma, conteúdo, experiências e
    resultados profissionais.
- [ ] Regressão visual completa não pôde ser confirmada.
  - O servidor local respondeu HTTP 200, mas a automação de navegador não estava disponível
    para confirmar a apresentação visual e o overflow.
- [x] Suíte automatizada executada: 7 arquivos de teste e 71 testes aprovados com Vitest.
- [x] Build de produção executado com sucesso via `npm run build`.
- [ ] Lint ou checagem equivalente completa — não há script `lint` configurado no
      `package.json`. Prettier e `git diff --check` passaram.
- [ ] Warning de orçamento do SCSS resolvido — o build passou, mas reportou 5,06 kB contra
      o limite de aviso de 4 kB para `portfolio-page.scss`.

## Entrega

- [ ] O procedimento de deploy corresponde ao que realmente será feito.
  - Não confirmado nesta revisão; nenhum deploy foi executado.
- [ ] O rollback é executável.
  - Não confirmado: a feature está em working tree sem um commit próprio ou evidência de
    rollback no ambiente de hospedagem.
- [x] O diff de código está restrito a três arquivos da página pública: componente,
      estilos e teste.
- [x] Nenhuma alteração de banco, Supabase, autenticação ou outra feature foi encontrada.
- [x] Nenhum deploy foi executado ou aprovado por esta revisão.
- [ ] As tarefas T-001 a T-013 permanecem sem marcação no arquivo de tarefas, conforme a
      regra de que a aprovação final não deve ser feita automaticamente.

## Divergências encontradas

1. **Destaque visual posicional:** `section:nth-child(2) .section-index` passou a destacar
   “Stack técnica” em vermelho após a mudança de ordem. O plano previa preservar a
   identidade visual; o código não usa um seletor semântico para preservar o destaque
   originalmente associado à seção de Experiências. Requer decisão de Marcos ou correção
   antes do deploy.

2. **Validação visual ausente:** o plano exige verificação em todos os tamanhos de tela e
   do caso de conteúdo extenso. A suíte automatizada confirma a ordem, mas não confirma
   layout CSS, sobreposição, corte ou overflow em navegador.

3. **Prioridade formal não definida:** o plano não atribui IDs de prioridade alta. A revisão
   tratou os requisitos centrais da feature como prioritários, mas essa classificação não
   pode ser confirmada diretamente a partir do plano.

4. **Entrega/rollback não comprovados:** não há commit específico da feature nem evidência
   de procedimento de deploy/rollback testado. Isso não bloqueia a revisão funcional, mas
   mantém o portão de deploy pendente.

5. **Warning de budget:** o build conclui com warning de tamanho do SCSS. Não é erro de
   compilação, mas deve ser considerado antes da aprovação caso o limite seja obrigatório.

## Decisão do portão

- [x] Convergência estrutural confirmada para FR-002.
- [ ] Convergência completa confirmada para FR-001 e AC-001 — falta evidência visual.
- [ ] AC-002 confirmado — falta teste visual com conteúdo extenso.
- [ ] Divergência do destaque visual resolvida ou aprovada.
- [ ] Requisitos prioritários completamente testados.
- [ ] Deploy aprovado — permanece pendente de decisão de Marcos.

