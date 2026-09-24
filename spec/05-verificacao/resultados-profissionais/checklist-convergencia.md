# Checklist de Convergência — Resultados profissionais

Status: Revisão concluída — deploy não aprovado  
Data: 2026-09-24  
Base revisada: `b4feeb1 feat: implementa apresentacao e sobre mim` + alterações locais não commitadas

Spec relacionada: `spec/03-features/resultados-profissionais/spec.md`  
Plano relacionado: `spec/04-plano/resultados-profissionais/plano.md`  
Tarefas relacionadas: `spec/04-plano/resultados-profissionais/tarefas.md`

## Resumo da revisão

A comparação foi feita entre a Spec aprovada, o plano aprovado, as tarefas, o código em
`src/app/features/portfolio/` e os testes Vitest.

A convergência funcional foi confirmada para a seção, as quatro categorias de resultados,
a disponibilidade parcial, a ausência total, o idioma e o fallback. A suíte automatizada
passou com 67 testes e o build de produção passou.

O deploy permanece pendente porque a verificação visual desktop/móvel não pôde ser
executada: o CLI `agent-browser` não está disponível e o navegador integrado falhou ao
inicializar. O rollback operacional também não foi confirmado, pois as alterações da
feature ainda estão não commitadas.

## Rastreio Spec ↔ Plano/Tarefas ↔ Código ↔ Testes

| Requisito/critério | Código | Teste/evidência | Status |
|---|---|---|---|
| FR-001 — disponibilizar seção dedicada na página única | `portfolio-page.ts` adiciona `resultados-profissionais`; `portfolio-page.html` renderiza a seção e a navegação | `portfolio-page.spec.ts`: seção e link presentes; build aprovado | Confirmado |
| FR-002 — apresentar redução de tempo | `portfolio-content.ts` e `portfolio-translations.ts` carregam o resultado aprovado de tempo; template renderiza o card | Teste do caminho feliz verifica “dias para horas” | Confirmado |
| FR-003 — apresentar redução de etapas | Chaves `resultsStepsReduction` em PT/EN e card independente | Teste do caminho feliz verifica “8–10 para 3–5” | Confirmado |
| FR-004 — apresentar usuários atendidos | Chaves `resultsUsersServed` em PT/EN e card independente | Teste do caminho feliz verifica “2.000” | Confirmado |
| FR-005 — apresentar ganhos de produtividade | Chaves `resultsProductivityGain` em PT/EN e card independente | Teste do caminho feliz verifica “50%” | Confirmado |
| FR-006 — resultado objetivo, contextualizado e aprovado | Conteúdo aprovado está explícito nas cópias PT/EN; ausência de conteúdo não cria card | Testes de caminho feliz, conteúdo parcial e ausência total; não há teste automatizado de confidencialidade | Confirmado com ressalva |
| FR-007 — idioma selecionado e fallback original | selectPortfolioCopy() cobre o fallback da fonte local; a composição final também mescla remoteCopy sobre a cópia local | portfolio-content.spec.ts e portfolio-page.spec.ts cobrem fallback da fonte local, mas não uma resposta parcial do Supabase | Confirmado com ressalva |
| AC-001 — caminho feliz | Os quatro cards são renderizados quando há conteúdo aprovado | `portfolio-page.spec.ts` verifica seção, link, quatro cards e métricas principais | Confirmado |
| AC-002 — caminho de erro sem resultados | `resultItems()` fica vazio; seção e link não são renderizados | `portfolio-page.spec.ts` remove todos os resultados e verifica a ausência da seção | Confirmado |
| AC-003 — idioma selecionado | A página usa `selectPortfolioCopy()` e os catálogos PT/EN | Teste existente de alternância e teste de catálogo/fallback; não houve inspeção visual no browser | Confirmado com ressalva |
| AC-004 — fallback de idioma | Resultado sem tradução na fonte local usa o conteúdo original; fallback após resposta remota parcial ainda não está confirmado | Teste específico de fallback em portfolio-page.spec.ts; não há teste de remoteCopy parcial | Confirmado com ressalva |

## Requisitos

- [x] Todo comportamento implementado corresponde a um requisito da Spec ou está
      documentado como decisão consciente fora da Spec.
  - A implementação adiciona somente a seção, seus conteúdos aprovados, navegação,
    fallback, disponibilidade parcial/total, estilos e testes previstos no plano.
  - Os seis resultados da Spec do Produto foram agrupados nas quatro categorias da
    feature: tempo e produtividade possuem duas métricas aprovadas cada. Nenhuma métrica
    nova foi criada.
- [x] O critério de aceite reflete o comportamento final de verdade.
  - AC-001 e AC-002 têm cobertura automatizada direta; AC-004 cobre a fonte local, com ressalva para resposta remota parcial.
  - AC-003 tem cobertura de seleção/fallback automatizada, com ressalva de ausência de
    validação visual no navegador.

## Arquitetura

- [x] A estrutura de pastas/módulos respeita `spec/02-arquitetura/ARQUITETURA.md`.
  - As alterações estão em `src/app/features/portfolio/content/` e
    `src/app/features/portfolio/presentation/portfolio-page/`.
  - Não foi criada nova rota, feature de domínio, service global ou repository.
- [x] Nenhum limite arquitetural foi cruzado.
  - Não houve acesso direto ao banco no componente, alteração de autenticação, Storage,
    RLS, schema ou migration.

## Dados

- [x] Migration testada, se houve mudança de schema — não aplicável; não houve alteração
      de schema, banco, Storage ou Supabase.
- [x] Sei como reverter se a migration der problema — não aplicável; nenhuma migration
      foi criada ou alterada.

## Testes

- [ ] Requisitos de prioridade alta têm verificação feita.
  - A feature não possui um plano de testes específico em
    `spec/05-verificacao/resultados-profissionais/` nem classificação formal de
    prioridade no plano aprovado. O caminho principal, erro sem conteúdo, idioma,
    fallback e regressão foram testados; a confirmação formal de “prioridade alta” não
    pôde ser feita.
- [x] Regressão checada — não há indício de regressão nas features existentes.
  - A suíte completa passou: 7 arquivos e 67 testes aprovados.
  - Os testes existentes da página, navegação, idioma, fallback e ausência de conteúdo
    continuam passando.
- [x] Suíte automatizada executada: 67 testes aprovados com Vitest.
- [x] Build de produção executado com sucesso via `npm run build`.
- [x] Checagem de formatação executada: `npx prettier --check` passou.
- [ ] Lint ou checagem equivalente — não pôde ser confirmado porque o projeto não possui
      script `lint` configurado.
- [ ] Verificação visual desktop/móvel — não pôde ser confirmada. O preview local
      respondeu HTTP 200 e entregou `<app-root>`, mas o browser automatizado não ficou
      disponível para inspecionar layout, overflow e navegação visualmente.

## Entrega

- [ ] O procedimento de deploy corresponde ao que realmente será feito.
  - Não confirmado. Nenhum deploy foi executado nesta revisão e não há procedimento de
    deploy específico da feature validado neste checklist.
- [ ] O rollback é executável.
  - Não confirmado. As alterações ainda estão no working tree e não há commit próprio da
    feature. É necessário criar um estado versionado e validar o procedimento de
    reversão antes do deploy.
- [x] A base versionada foi identificada: `b4feeb1 feat: implementa apresentacao e sobre mim`.
- [x] Nenhum deploy foi executado ou aprovado por esta revisão.
- [ ] A aprovação final de Marcos foi registrada — pendente; este checklist não aprova o
      deploy.

## Divergências encontradas

1. O plano prevê validação visual desktop, móvel estreita e móvel larga. A implementação
   possui estilos responsivos e testes automatizados, mas a validação visual não pôde ser
   executada por indisponibilidade do browser automatizado. O preview teve apenas
   confirmação HTTP 200.
2. O plano de testes específico da feature e a classificação formal de prioridade alta
   não existem em `spec/05-verificacao/resultados-profissionais/`. Por isso, a cobertura
   funcional foi executada, mas o item formal de prioridade alta não pode ser marcado como
   confirmado.
3. O plano prevê rollback da feature, mas as alterações ainda não estão em um commit
   próprio. O rollback por estado versionado não foi comprovado.
4. O conteúdo da feature usa quatro cards para representar os quatro grupos pedidos; o
   grupo de redução de tempo contém duas métricas aprovadas e o grupo de produtividade
   contém duas métricas aprovadas. Isso é uma agregação intencional dos seis resultados
   divulgáveis da Spec do Produto, sem criar conteúdo adicional.
5. O projeto não possui script de lint; build, testes, Prettier e `git diff --check` foram
   usados como verificações disponíveis.
6. O fallback após resposta parcial do Supabase não está coberto: PortfolioPage calcula
   primeiro a cópia local do idioma selecionado e depois mescla remoteCopy. Se uma chave
   de resultado estiver ausente na resposta remota em inglês, o comportamento observado
   pode manter ENGLISH_COPY em vez de usar diretamente ORIGINAL_COPY. A cobertura atual
   confirma apenas o fallback da fonte local; isso precisa ser testado ou decidido antes
   da aprovação do deploy.

## Decisão do portão

- [ ] Convergência funcional totalmente confirmada para FR-001 a FR-007 e AC-001 a
      AC-004 — FR-007/AC-004 ainda têm a ressalva do fallback após resposta remota
      parcial.
- [ ] Requisitos de prioridade alta formalmente confirmados — pendente da ausência de
      plano de teste/classificação específica.
- [ ] Verificação visual desktop/móvel confirmada — pendente de browser disponível.
- [ ] Rollback operacional confirmado — pendente de estado versionado/commit da feature.
- [ ] Deploy aprovado — permanece pendente de decisão de Marcos.
