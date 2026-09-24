# Tarefas — Experiências profissionais

Plano relacionado: `spec/04-plano/experiencias-profissionais/plano.md`

## Regra das tarefas

Cada tarefa é pequena o suficiente para ser revisada de uma vez, referencia o requisito
que implementa e define como verificar que ficou pronta.

## Fase 1 — Base

- [x] T-001 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Confirmar os pontos de integração existentes e registrar a decisão aprovada de publicar nome da empresa e cargo.
  - Arquivos/módulos: `src/app/features/portfolio/content/`, `src/app/features/portfolio/presentation/portfolio-page/`, `spec/02-arquitetura/DECISAO_TEMPLATE.md`.
  - Verificação: confirmar que a publicação de nome e cargo foi aprovada por Marcos; registrar/aprovar o ADR se for mantida a decisão rastreável; confirmar que não será criada nova rota, pasta de domínio, service global ou acesso direto ao Supabase.
- [x] T-002 [FR-004, FR-008] Criar a migration versionada para renomear `portfolio_experiences.company_context` para `portfolio_experiences.name` e validar os registros aprovados.
  - Arquivos/módulos: `supabase/migrations/<timestamp>_rename_company_context_to_name.sql`, dados de `portfolio_experiences` e `portfolio_experience_translations`.
  - Verificação: migration aplica e reverte sem perda de dados; `name` contém o nome aprovado da empresa; `context` continua contendo somente o contexto; todos os campos obrigatórios permanecem preenchidos; nenhuma informação confidencial ou placeholder é publicada.
- [x] T-003 [FR-001] Fixar a regra de ordenação usando `start_date` para “mais recente” e `display_order` para desempate pela ordem de inclusão.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.service.ts`, schema de `portfolio_experiences` e Spec da feature.
  - Verificação: fixture com datas diferentes retorna a ordem por `start_date` decrescente; fixture com mesma data ou sobreposição respeita `display_order`; a regra não usa `end_date` como chave principal.
## Fase 2 — Lógica principal

- [x] T-004 [FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Ajustar o contrato `PortfolioExperience` e o mapeamento de `listExperiences()` para ler `name` e todos os campos estruturados.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.models.ts` e `portfolio-content.service.ts`.
  - Verificação: o serviço retorna nome, cargo, período, contexto, responsabilidades, decisões técnicas e resultados; o mapeamento usa `row['name']`; erros de leitura continuam retornando coleção segura sem lançar erro para a página.
- [x] T-005 [FR-001, FR-002] Implementar a ordenação da coleção por `start_date` decrescente e o desempate por `display_order` crescente.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.service.ts` ou helper no mesmo domínio.
  - Verificação: fixture com datas diferentes retorna a experiência mais recente primeiro; fixture com mesma data ou períodos sobrepostos respeita `display_order`; o período disponível mantém dados suficientes para formatação `MM/YYYY`.
- [x] T-006 [FR-001, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Integrar o carregamento de experiências ao estado da página e à alternância de idioma.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts` e `PortfolioContentService` já existente.
  - Verificação: a página carrega as experiências no idioma selecionado; ao trocar o idioma, os campos traduzidos são atualizados; nenhum componente de apresentação faz chamada direta ao Supabase.

- [x] T-007 [FR-001, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Controlar a visibilidade da seção e do item de navegação quando a coleção estiver vazia ou indisponível.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts`.
  - Verificação: coleção com experiências produz estado visível; coleção vazia ou erro de leitura não produz `#experiencias` nem link para ele; as demais seções continuam disponíveis.

## Fase 3 — Interface

- [x] T-008 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Substituir o texto mockado pela lista estruturada de experiências na página única.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html` e `portfolio-page.ts`.
  - Verificação: para cada experiência são renderizados nome da empresa, cargo, período, contexto, responsabilidades, decisões técnicas e resultados; o texto simples mockado não aparece; a ordem renderizada corresponde à coleção ordenada.

- [x] T-009 [FR-002] Formatar o período de cada experiência como `MM/YYYY` para início e fim.
  - Arquivos/módulos: helper ou método no domínio `portfolio/presentation`/`content`, conforme o contrato final, e `portfolio-page.html`.
  - Verificação: datas de fixture aparecem como `MM/YYYY`; nenhum formato localizado ou texto improvisado substitui o formato aprovado; registros sem período completo não são mascarados como válidos.

- [x] T-010 [FR-001, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Aplicar estilos responsivos e marcação semântica à seção de experiências.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss` e `portfolio-page.html`.
  - Verificação: validar desktop, mobile estreito e mobile largo; confirmar legibilidade, ausência de overflow horizontal, listas compreensíveis e preservação visual das seções existentes.

## Fase 4 — Testes

- [x] T-011 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Cobrir o mapeamento e a ordenação no serviço de conteúdo.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.service.spec.ts`.
  - Verificação: testes passam para múltiplas experiências, nome/cargo, período, campos de conteúdo, ordem cronológica, desempate por inclusão e erro de consulta.

- [x] T-012 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Cobrir o caminho feliz da página pública.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.spec.ts`.
  - Verificação: reproduzir AC-001 e AC-002; confirmar seção visível, navegação estável, ordem mais recente-primeiro e presença de todos os campos, incluindo nome da empresa e cargo.

- [x] T-013 [FR-001, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Cobrir o caminho de erro sem experiências e a regressão das seções existentes.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.spec.ts`.
  - Verificação: reproduzir AC-003; confirmar ausência da seção e do link de navegação; confirmar que apresentação, “Sobre mim”, stack e resultados continuam funcionando.

- [x] T-014 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Executar a regressão completa da aplicação e a verificação visual da página pública.
  - Arquivos/módulos: suíte existente, build do projeto, preview e checklist de verificação.
  - Verificação: testes e build concluem sem erro; alternância de idioma e navegação continuam funcionando; validar desktop/mobile e registrar qualquer divergência antes da entrega.

## Fase 5 — Entrega

- [x] T-015 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Comparar Spec, plano, tarefas, implementação e testes antes da entrega.
  - Arquivos/módulos: `spec/03-features/experiencias-profissionais/spec.md`, plano, tarefas, diff da feature e evidências de teste.
  - Verificação: todos os FR e AC estão cobertos; não há requisito inventado; a única migration é a renomeação aprovada de `company_context` para `name`; não há alteração administrativa ou informação confidencial fora do escopo.

- [x] T-016 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Validar preview, rollback e aprovação final antes de qualquer deploy.
  - Arquivos/módulos: preview da aplicação, estado de referência do repositório e checklist de verificação.
  - Verificação: confirmar comportamento em desktop/mobile, registrar como reverter somente as alterações da feature, obter revisão/aprovação de Marcos e não executar deploy antes dessa aprovação.

## Adiado (fora do escopo desta rodada)

- [ ] Criar outra tabela ou alterar o schema além da migration aprovada para renomear `company_context` para `name`.
- [ ] Criar área administrativa, formulário de cadastro ou fluxo de edição de experiências.
- [ ] Alterar autenticação, RLS, Storage ou permissões do Supabase.
- [ ] Criar nova rota pública, nova feature de domínio ou serviço global.
- [ ] Inventar conteúdo, traduzir campos sem aprovação ou publicar informação confidencial.
- [ ] Criar filtros, ordenação interativa ou múltiplas páginas para experiências.
