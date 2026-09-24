# Checklist de Convergência — Experiências profissionais

Status: Revisão concluída — deploy não aprovado  
Data: 2026-09-24  
Base revisada: `ab488be docs-registra-deploy-resultados-profissionais` + alterações locais não commitadas

Spec relacionada: `spec/03-features/experiencias-profissionais/spec.md`  
Plano relacionado: `spec/04-plano/experiencias-profissionais/plano.md`  
Tarefas relacionadas: `spec/04-plano/experiencias-profissionais/tarefas.md`

## Resumo da revisão

A comparação foi feita entre a Spec aprovada, o plano, as tarefas marcadas como
concluídas, o código em `src/app/features/portfolio/`, as migrations e a suíte Vitest.

A lógica principal converge: o serviço lê `name`, ordena por `start_date` decrescente e
`display_order` crescente, a página renderiza os campos estruturados e a seção/navegação
somem quando não há experiências. A suíte automatizada passou com 7 arquivos e 71 testes,
e o build de produção passou.

A convergência total não pôde ser confirmada. A implementação não valida ou exclui
registros com campos obrigatórios ausentes; períodos incompletos podem ser renderizados
com parte vazia. A migration foi criada, mas não foi aplicada e revertida contra um banco
real nesta revisão. Também não há evidência de validação visual desktop/mobile, de rollback
operacional ou de classificação formal de prioridade alta para os testes.

## Rastreio Spec ↔ Plano/Tarefas ↔ Código ↔ Testes

| Requisito/critério | Código | Teste/evidência | Status |
|---|---|---|---|
| FR-001 — experiências da mais recente para a mais antiga | `portfolio-content.service.ts` ordena por `start_date` decrescente e depois `display_order`; `portfolio-page.html` renderiza a coleção nessa ordem | `portfolio-content.service.spec.ts` verifica datas diferentes, mesma data e sobreposição; `portfolio-page.spec.ts` verifica a ordem renderizada | Confirmado |
| FR-002 — período em `MM/YYYY` para início e fim | `formatExperienceDate()` em `portfolio-page.ts` converte datas ISO para `MM/YYYY` | Teste da página verifica `05/2025 – 03/2026` | Confirmado com ressalva: não há teste nem bloqueio para período incompleto |
| FR-003 — cargo | `experience.title` em `portfolio-page.html` | Teste do caminho feliz verifica `Engenheiro de software`; teste de idioma verifica cargo em inglês | Confirmado |
| FR-004 — contexto | `experience.context` em `portfolio-page.html` | Teste do caminho feliz verifica `Setor de laticínios`; teste de idioma verifica contexto em inglês | Confirmado |
| FR-005 — responsabilidades | Lista `experience.responsibilities` em `portfolio-page.html` | Teste do caminho feliz verifica `Responsabilidade nova` | Confirmado |
| FR-006 — decisões técnicas | Lista `experience.technicalDecisions` em `portfolio-page.html` | Teste do caminho feliz verifica `Decisão nova` | Confirmado |
| FR-007 — resultados | Lista `experience.results` em `portfolio-page.html` | Teste do caminho feliz verifica `Resultado novo` | Confirmado |
| FR-008 — nome da empresa e cargo | `row['name']` no serviço; `experience.name` e `experience.title` no template; migration renomeia a coluna | Teste do serviço verifica o nome; teste da página verifica nome e cargo; ADR registra a aprovação da publicação | Confirmado quanto ao contrato; dados reais aprovados não foram validados nesta revisão |
| BR-004 — campos obrigatórios antes da publicação | O serviço converte ausência de tradução em strings vazias/listas vazias e ainda retorna a experiência | Não há teste para tradução ausente, campo vazio ou período incompleto | **Não confirmado; divergência de implementação** |
| BR-005 — desempate pela ordem de inclusão | `display_order` é usado como segundo critério no Supabase e no sort local | Fixture `tie-first`/`tie-second` e períodos sobrepostos verificam a ordem | Confirmado |
| BR-006 / AC-003 — sem experiências, ocultar seção | `showExperiences()` controla a seção e `navigationItems()` controla o link | `portfolio-page.spec.ts` verifica ausência de `#experiencias` e do link | Confirmado |
| AC-001 — caminho feliz estruturado | Template substitui o parágrafo mockado por cards com todos os campos | Teste da página verifica ordem, período, empresa, cargo, contexto, responsabilidades, decisões e resultados | Confirmado com ressalva do BR-004 |
| AC-002 — empresa e cargo publicados | Template renderiza `name` e `title` | Teste do caminho feliz e ADR | Confirmado |

## Requisitos

- [ ] Todo comportamento implementado corresponde a um requisito da Spec ou está
      documentado como decisão consciente fora da Spec.
  - A maior parte converge com a Spec, mas o comportamento para dados incompletos não
    atende BR-004 nem a verificação prevista em T-009: o sistema não rejeita nem oculta
    uma experiência com período/tradução incompleta.
- [ ] O critério de aceite reflete integralmente o comportamento final de verdade.
  - AC-001, AC-002 e AC-003 passam para fixtures válidas e coleção vazia. A parte de
    campos obrigatórios não está comprovada para dados inválidos ou incompletos.

## Arquitetura

- [x] A estrutura de pastas/módulos respeita `spec/02-arquitetura/ARQUITETURA.md`.
  - O código permanece em `src/app/features/portfolio/content/` e
    `src/app/features/portfolio/presentation/portfolio-page/`.
  - Não foi criada nova rota, feature de domínio, service global ou repository.
- [x] Nenhum limite arquitetural foi cruzado.
  - O componente não acessa o Supabase diretamente; a leitura passa por
    `PortfolioContentService`.
  - A publicação de nome/cargo está compatível com a decisão arquitetural registrada,
    sem evidência de segredo ou informação confidencial adicionada ao código.

## Dados e migration

- [ ] Migration aplicada e revertida em ambiente de banco — não pôde ser confirmado.
  - Existe `supabase/migrations/20260924090000_rename_company_context_to_name.sql`, mas
    nesta revisão não houve execução contra banco real nem validação dos registros e
    traduções aprovados.
- [x] Existe caminho textual de rollback da migration.
  - O arquivo documenta o rename reverso de `name` para `company_context`.
- [ ] Rollback operacional comprovado.
  - A reversão não foi executada e as alterações da feature ainda não estão em commit
    próprio.
- [ ] Dados reais e traduções aprovados confirmados antes da validação visual.
  - A decisão foi informada como confirmada, mas não há evidência de consulta/seed ou
    ambiente persistido nesta revisão.

## Testes

- [ ] Requisitos de prioridade alta têm confirmação formal no plano de verificação.
  - O plano da feature define a Fase 4 e os cenários principais, mas não classifica
    formalmente FRs como prioridade alta nem há um plano de teste específico em
    `spec/05-verificacao/experiencias-profissionais/`. O caminho principal e o erro sem
    experiências foram testados; a confirmação formal de prioridade alta não pôde ser
    feita.
- [x] Caminho principal automatizado.
  - A página renderiza duas experiências ordenadas e verifica todos os campos pedidos.
- [x] Caminho de erro sem experiências automatizado.
  - A seção e o link de navegação não são renderizados para coleção vazia.
- [ ] Campos obrigatórios ausentes ou período incompleto automatizados.
  - Não há teste e o comportamento atual não bloqueia a publicação desses registros.
- [x] Regressão automatizada sem indício de falha.
  - A suíte completa passou: 7 arquivos e 71 testes aprovados.
  - Os testes existentes de navegação, alternância de idioma, fallback, resultados e
    ausência de conteúdo continuam passando.
- [x] Build de produção executado com sucesso via `npm run build`.
  - Há um warning de orçamento: `portfolio-page.scss` totaliza 5.07 kB contra o limite
    de alerta de 4.00 kB. O build não falhou.
- [x] `git diff --check` executado.
  - Não foram encontrados erros de whitespace; os avisos apresentados são apenas sobre
    conversão futura de LF para CRLF.
- [ ] Lint ou checagem equivalente dedicada.
  - `package.json` não possui script `lint`; nenhum lint dedicado pôde ser confirmado.
- [ ] Verificação visual desktop/mobile.
  - Os estilos responsivos existem, mas não há evidência registrada de preview/browser
    para desktop, mobile estreito e mobile largo nesta revisão.

## Entrega

- [ ] O procedimento de deploy corresponde ao que realmente será feito.
  - Não há documento de deploy específico para esta feature e nenhum deploy foi
    executado nesta revisão.
- [ ] O rollback da entrega é executável.
  - A migration possui instrução reversa, mas não foi exercitada; o conjunto de
    alterações da feature ainda está no working tree e não possui commit próprio.
- [x] Existe uma base versionada para comparação: `ab488be`.
- [x] Nenhum deploy foi executado ou aprovado por esta revisão.
- [ ] A aprovação final de Marcos foi registrada — permanece pendente.

## Divergências encontradas

1. **Campos obrigatórios não são validados em runtime.** A Spec/BR-004 e T-009 exigem
   que experiências sem período completo ou conteúdo obrigatório não sejam consideradas
   válidas. O serviço ainda retorna uma experiência com strings vazias quando a tradução
   falta, e `formatExperiencePeriod()` pode produzir um período parcialmente vazio quando
   `end_date` é nulo. O cenário não é coberto pelos testes.
2. **Migration e dados não foram validados em banco real.** A migration de rename existe e
   preserva o valor por operação de schema, mas aplicação, rollback, constraints e os
   registros/traduções aprovados não foram confirmados nesta revisão.
3. **Validação visual prevista no plano não foi comprovada.** T-010, T-014 e T-016 pedem
   desktop, mobile estreito e mobile largo; há estilos e testes DOM, mas não há evidência
   visual registrada.
4. **Prioridade alta não está formalizada.** O plano descreve cenários, mas não define
   classificação formal e não existe plano de teste específico da feature. Portanto, os
   cenários principais foram executados, mas o item formal de prioridade alta permanece
   não confirmado.
5. **Tarefas T-001 a T-016 estão marcadas como concluídas, mas T-002 e T-016 não têm
   evidência suficiente de verificação.** A marcação foi mantida como estado informado;
   este checklist não a trata como prova de execução.
6. **Não há lint configurado.** O build, a suíte Vitest e `git diff --check` foram as
   checagens disponíveis. O warning de orçamento do SCSS deve ser avaliado antes do
   deploy, embora não tenha impedido o build.

## Decisão do portão

- [ ] Convergência funcional totalmente confirmada para FR-001 a FR-008 e AC-001 a
      AC-003 — pendente da regra de campos obrigatórios/períodos incompletos e da
      validação dos dados reais.
- [x] Regressão automatizada sem indício de quebra nas features existentes.
- [ ] Requisitos de prioridade alta formalmente confirmados — pendente de classificação
      e evidência específica.
- [ ] Migration aplicada/revertida e dados aprovados confirmados — pendente.
- [ ] Verificação visual desktop/mobile confirmada — pendente.
- [ ] Rollback operacional confirmado — pendente de execução e estado versionado.
- [ ] Deploy aprovado — permanece pendente da decisão de Marcos.
