# Checklist de Convergência — Projetos profissionais e pessoais

Status: Revisão concluída — deploy não aprovado  
Data: 2026-09-24  
Base revisada: working tree atual, build/testes registrados nesta implementação e artefatos aprovados da feature

Spec relacionada: `spec/03-features/projetos-profissionais-e-pessoais/spec.md`  
Plano relacionado: `spec/04-plano/projetos-profissionais-e-pessoais/plano.md`  
Tarefas relacionadas: `spec/04-plano/projetos-profissionais-e-pessoais/tarefas.md`

## Resumo da revisão

A comparação foi feita entre a Spec aprovada, o plano, as tarefas, o código em
`src/app/features/portfolio/`, a migration e os testes automatizados.

A implementação converge funcionalmente para a apresentação pública, agrupamento,
campos obrigatórios, links, idioma, fallback, ausência de projetos e preservação dos
destinos existentes. A suíte registrada passou com 7 arquivos e 78 testes, e o build
de produção terminou com sucesso.

A convergência total não pôde ser confirmada antes do deploy. A migration não faz
backfill automático — ela falha com segurança quando encontra projeto sem classificação
— e não foi aplicada/revertida em ambiente remoto. Também não há evidência de preview
remoto, verificação visual desktop/mobile ou revisão manual de confidencialidade nesta
rodada. O plano não define formalmente quais FRs são de prioridade alta.

## Rastreio Spec ↔ Plano/Tarefas ↔ Código ↔ Testes

| Requisito | Código/evidência | Teste/evidência | Status |
|---|---|---|---|
| FR-001 — separar projetos profissionais e pessoais | `PortfolioPage` separa `professionalProjects()` e `personalProjects()`; o template renderiza duas subseções condicionais | `portfolio-page.spec.ts` verifica os dois tipos e as duas subseções | Confirmado para fixtures |
| FR-002 — exibir nome/título | `project.name` em `portfolio-page.html`; campo obrigatório em `hasPortfolioProjectContent()` | Teste da página verifica o nome | Confirmado |
| FR-003 — indicar tipo | Títulos e `data-testid` das subseções profissional/pessoal; tipo persistido por `project_type` | Teste verifica presença e separação | Confirmado para fixtures; dado remoto não validado |
| FR-004 — exibir descrição | `project.description` no card | Teste do caminho feliz verifica descrição | Confirmado |
| FR-005 — exibir contexto | `project.problemContext` no card | Teste do caminho feliz verifica contexto | Confirmado |
| FR-006 — exibir papel desempenhado | `project.role` no card | Teste do caminho feliz verifica papel | Confirmado |
| FR-007 — exibir decisões técnicas | Lista `project.technicalDecisions` | Teste do caminho feliz verifica decisão | Confirmado |
| FR-008 — exibir tecnologias | Lista `project.technologies` | Teste do caminho feliz verifica tecnologia | Confirmado |
| FR-009 — exibir resultados | Lista `project.results` | Teste do caminho feliz verifica resultado | Confirmado |
| FR-010 — exibir aprendizados | Lista `project.learnings` | Teste do caminho feliz verifica aprendizado | Confirmado |
| FR-011 — exibir links relacionados | `projectLinks()` preserva objetos `label`/`url`; template gera `<a>` apenas quando há links | Testes verificam label, URL e ausência de bloco vazio | Confirmado para o contrato testado |
| FR-012 — ocultar seção sem projetos | `loadProjects()` filtra projetos completos; `showProjects()` controla seção e navegação | Teste verifica ausência de seção e link | Confirmado |
| FR-013 — idioma selecionado | `loadProjects()` é chamado na inicialização, troca manual e popup; serviço consulta locale | Teste da página verifica troca; teste do serviço verifica locale/fallback | Confirmado com ressalva de ausência de ambiente remoto |
| AC-001 — caminho feliz | Template apresenta as duas subseções e todos os campos obrigatórios | Teste da página cobre os dois tipos, campos e link | Confirmado para fixtures |
| AC-002 — ausência de projetos | Seção e item de navegação dependem da coleção final | Teste da página cobre coleção vazia | Confirmado |
| AC-003 — confidencialidade | Não há filtro automático de confidencialidade; a Spec confirmou revisão manual | Não há teste automatizado nem evidência de revisão editorial nesta rodada | **Não confirmado; portão manual pendente** |
| AC-004 — idioma selecionado | Traduções selecionadas pelo locale no serviço e recarregadas na página | Testes de serviço/página cobrem PT/EN com mocks | Confirmado com ressalva: sem conteúdo remoto real |
| AC-005 — fallback pt-BR | `getProjectTranslations()` mescla a tradução selecionada com a tradução pt-BR quando a tradução do projeto não existe | Teste do serviço cobre projeto sem tradução em inglês | Confirmado para tradução completa ausente |

## Requisitos

- [ ] Todo comportamento implementado corresponde integralmente à Spec ou está
      documentado como decisão consciente.
  - A lógica pública converge. A exceção de entrega é a migration: o plano menciona
    backfill, mas a implementação deliberadamente não infere classificações e aborta
    quando há registro sem tipo. A decisão está registrada em
    `spec/02-arquitetura/DECISAO-002-classificacao-tipo-projeto.md`.
  - A confidencialidade permanece uma revisão manual, conforme a decisão aprovada;
    portanto, não há proteção automática no código.
- [ ] O critério de aceite está integralmente comprovado.
  - AC-001, AC-002, AC-004 e AC-005 possuem cobertura automatizada com fixtures.
  - AC-003 depende da revisão manual de conteúdo e não pôde ser confirmado nesta
    revisão.

## Arquitetura

- [x] A estrutura de pastas respeita `spec/02-arquitetura/ARQUITETURA.md`.
  - A implementação permanece em `src/app/features/portfolio/content/` e
    `src/app/features/portfolio/presentation/portfolio-page/`.
  - A classificação fica na entidade existente `portfolio_projects`, sem nova rota,
    serviço global ou camada paralela.
- [x] Os limites arquiteturais foram respeitados.
  - O template não acessa Supabase diretamente; a leitura passa por
    `PortfolioContentService`.
  - A migration mantém RLS e policies existentes e não introduz segredo, escrita pública
    ou fluxo administrativo.

## Dados e migration

- [x] A migration é versionada e possui constraint para `professional`/`personal`.
  - Arquivo: `supabase/migrations/20260924205845_add_project_type_to_portfolio_projects.sql`.
- [ ] O requisito de backfill previsto no plano foi confirmado.
  - Não há backfill automático. A migration adiciona a coluna, falha se houver valor
    nulo e só então aplica constraint e `not null`. Isso é seguro, mas diverge do texto
    do plano que menciona preencher registros existentes.
- [x] Existe caminho textual de rollback.
  - A migration documenta a remoção da constraint e da coluna; o ADR registra a
    consequência e a ordem de remoção dos consumidores.
- [ ] Migration aplicada e revertida em ambiente remoto.
  - Não foi executada nesta revisão. Não foi usado ambiente local, conforme decisão do
    projeto, e não há evidência de execução no Supabase remoto.
- [ ] Rollback operacional comprovado.
  - O rollback SQL está documentado, mas não foi exercitado e a feature não possui
    commit próprio revisado para reversão.

## Testes

- [ ] Requisitos de prioridade alta foram formalmente confirmados.
  - O plano da feature descreve fases e cenários, mas não classifica formalmente FRs
    como prioridade alta e não há plano de teste específico em
    `spec/05-verificacao/projetos-profissionais-e-pessoais/`. O caminho principal,
    ausência de projetos, idioma/fallback e regressão têm evidência automatizada; a
    confirmação formal de prioridade alta não pôde ser feita.
- [x] Caminho principal automatizado.
  - O teste da página verifica projetos dos dois tipos, todos os campos obrigatórios e
    links.
- [x] Caminhos de erro funcionais automatizados.
  - Coleção vazia, projeto incompleto e projeto sem links são cobertos.
- [x] Alternância de idioma e fallback automatizados.
  - A página recarrega projetos ao mudar idioma; o serviço cobre fallback para pt-BR.
- [x] Regressão automatizada sem indício de quebra.
  - O registro de execução disponível indica 7 arquivos e 78 testes aprovados.
  - Os testes existentes de navegação, IDs, experiências, resultados, popup e idioma
    continuam passando.
- [x] Build de produção executado com sucesso.
  - `npm run build` terminou sem erro.
  - Há um warning de orçamento: `portfolio-page.scss` totaliza 6,09 kB contra o limite
    de 4,00 kB. O warning deve ser avaliado antes do deploy.
- [x] `git diff --check` executado.
  - Não foram encontrados erros de whitespace; os avisos observados são de normalização
    futura de LF/CRLF.
- [ ] Lint ou checagem equivalente dedicada.
  - O projeto não possui script `lint` configurado; nenhum lint dedicado foi confirmado.
- [ ] Verificação visual desktop/mobile.
  - Não há evidência de preview remoto ou browser automatizado nesta revisão. A
    verificação visual deve ocorrer no ambiente de preview/deploy, não localmente.
- [ ] Revisão manual de confidencialidade e conteúdo.
  - A aplicação não infere confidencialidade; a revisão editorial ainda precisa ser
    feita sobre os dados que serão publicados.

## Regressão em features existentes

- [x] Não há indício de regressão automatizada.
  - Os testes da página continuam cobrindo apresentação, sobre mim, stack, experiências,
    resultados, navegação, popup e alternância de idioma.
- [ ] Regressão visual e comportamento contra dados remotos não foram confirmados.
  - A ausência de preview remoto e de conteúdo Supabase persistido impede confirmar
    overflow, estabilidade visual e leitura end-to-end.

## Entrega

- [ ] O procedimento de deploy corresponde ao que será executado.
  - Não foi confirmado nesta revisão; não há preview remoto ou procedimento específico
    da feature registrado.
- [ ] O rollback da entrega é executável.
  - O rollback da migration está descrito, mas não foi exercitado em ambiente remoto e
    não há commit próprio da feature para reversão.
- [x] Nenhum deploy foi executado ou aprovado por esta revisão.
- [ ] Aprovação final de Marcos registrada.
  - Continua pendente por decisão do aprovador.

## Divergências encontradas

1. **Backfill da migration:** o plano menciona backfill seguro, mas a migration não
   preenche tipos automaticamente; ela interrompe a operação quando encontra projeto
   sem classificação. A razão é não inventar uma classificação sem mapeamento aprovado.
2. **Confidencialidade:** AC-003 depende exclusivamente de revisão manual, conforme a
   decisão registrada. O código não bloqueia nem redige conteúdo confidencial, e não há
   evidência editorial nesta revisão.
3. **Prioridade alta:** o plano não contém uma classificação formal de prioridade; por
   isso, a cobertura do caminho principal e dos erros óbvios foi confirmada, mas o item
   formal não pôde ser marcado.
4. **Verificação visual e dados reais:** não há evidência de preview remoto, leitura
   end-to-end do Supabase ou validação visual desktop/mobile.
5. **Warning de build:** a implementação passa no build, mas excede o orçamento de
   estilo do componente em 2,09 kB.
6. **Estado versionado:** as alterações da feature estão no working tree, sem commit
   próprio revisado; rollback operacional não foi comprovado.

## Decisão do portão

- [ ] Convergência funcional totalmente confirmada para FR-001 a FR-013 e AC-001 a
      AC-005 — pendente da revisão manual de confidencialidade, dados remotos e
      validação visual.
- [x] Regressão automatizada sem indício de quebra nas features existentes.
- [ ] Requisitos de prioridade alta formalmente confirmados — o plano não os classifica.
- [ ] Migration aplicada/revertida e dados aprovados confirmados — pendente em ambiente
      remoto.
- [ ] Verificação visual desktop/mobile confirmada — pendente.
- [ ] Rollback operacional confirmado — pendente.
- [ ] Deploy aprovado — permanece pendente da decisão de Marcos.
