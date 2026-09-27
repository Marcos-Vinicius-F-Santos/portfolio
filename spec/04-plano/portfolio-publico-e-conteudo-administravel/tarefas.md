# Tarefas — Portfólio público e conteúdo administrável

Plano relacionado: `spec/04-plano/portfolio-publico-e-conteudo-administravel/plano.md`  
Spec relacionada: `spec/03-features/portfolio-publico-e-conteudo-administravel/spec.md`  
Status: Rascunho  
Data: 2026-09-25

## Regra das tarefas

Executar uma tarefa por vez, na sequência numérica e sem pular fases, após a aprovação de
Marcos. Cada tarefa é pequena o suficiente para revisão isolada, referencia os requisitos
funcionais envolvidos e define como verificar que ficou pronta. Nenhuma tarefa abaixo
autoriza deploy ou alteração remota sem aprovação explícita posterior.

## Fase 1 — Base

- [ ] T-001 [FR-005, FR-010, FR-014, FR-017] Resolver e registrar as decisões bloqueadoras antes do código.
  - Arquivos/módulos: seção 8 da Spec da Feature; seção 7 do plano; `spec/02-arquitetura/DECISAO-001-publicacao-nome-cargo-experiencias.md`; eventual novo registro baseado em `DECISAO_TEMPLATE.md`.
  - Verificação: o critério visual de “About me”, a regra de não exibir empresas, a estratégia para falha de persistência e o formato de upload manual de ícone estão explicitamente aprovados ou registrados como decisão; nenhuma tarefa de interface começa com esses pontos silenciosos.

- [ ] T-002 [FR-001, FR-002, FR-003, FR-006, FR-010, FR-011, FR-012, FR-013, FR-016, FR-019] Inventariar o comportamento atual e criar a referência de regressão.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/`; `src/app/features/portfolio/content/`; `src/app/features/admin/`; `src/app/app.routes.ts`; futuro `spec/05-verificacao/portfolio-publico-e-conteudo-administravel/`.
  - Verificação: inventário registra títulos, ordem, IDs/âncoras, numerações atuais, largura de “About me”, contatos nas duas posições, campos da Admin page, operações de inserir/editar/excluir e resultado inicial de testes/build; nenhum conteúdo existente é substituído.

- [ ] T-003 [FR-007, FR-008, FR-009, FR-010, FR-011, FR-013, FR-014, FR-015, FR-017, FR-018] Congelar os contratos de domínio e de fallback.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.models.ts`, `src/app/features/admin/content-management/admin-content.models.ts` e tipos da mídia.
  - Verificação: os contratos representam somente `pt-BR`/`en`, períodos e andamento acadêmico, competências/conteúdos, referência opcional de ícone, contatos canônicos, ordem de experiências, fallback por conteúdo e limite de 1 MB; a compilação dos consumidores atuais continua possível.

- [ ] T-004 [FR-007, FR-008, FR-009, FR-011, FR-016, FR-017, FR-018] Criar e revisar a migration aditiva de schema, Storage e RLS.
  - Arquivos/módulos: novo arquivo em `supabase/migrations/`, sem editar migrations existentes; documentação de rollback em `spec/05-verificacao/` ou no plano aprovado.
  - Verificação: migration adiciona somente os campos/bucket/policies aprovados, mantém `portfolio_project_images` limitado a 1 MB, restringe escrita a `portfolio_admins`, mantém leitura pública necessária, não concede escrita anônima e possui caminho de volta sem apagar registros/objetos existentes.

## Fase 2 — Lógica principal

- [ ] T-005 [FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015] Estender os modelos e a leitura pública do `PortfolioContentService`.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.service.ts`, `portfolio-content.models.ts` e catálogos de fallback.
  - Verificação: leitura persistida retorna skills/categorias, formação completa, contatos, experiências e projetos com os campos novos; experiências ficam da mais recente para a mais antiga; tradução ausente usa `pt-BR`; falha de leitura não transforma o conteúdo em strings vazias; os catálogos locais continuam apenas como fallback aprovado.

- [ ] T-006 [FR-010, FR-011, FR-014, FR-016, FR-017] Aplicar o contrato público de experiências e projetos sem expor nomes de empresas.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.service.ts`, modelos e adaptadores usados pela página pública.
  - Verificação: DTOs consumidos pela apresentação não expõem o nome da empresa; período, cargo, contexto, responsabilidades, decisões, resultados e traduções continuam disponíveis; projetos mantêm todos os campos, links e imagens; a ordem de projetos existente permanece.

- [ ] T-007 [FR-007, FR-011, FR-016, FR-017, FR-018] Estender o `MediaManagementService` para ícones de skills e validar mídias.
  - Arquivos/módulos: `src/app/features/admin/media-management/media-management.service.ts`, `media-management.models.ts`, componente de mídia existente e serviço público de conteúdo.
  - Verificação: upload manual respeita o limite de 1 MB e os formatos aprovados; caminho é único; falha antes da associação remove o objeto novo; URL pública inválida usa a imagem manual; sem fallback, o ícone/imagem fica vazio; projeto continua usando o fluxo existente de upload e substituição.

- [ ] T-008 [FR-008, FR-009, FR-013, FR-014, FR-016, FR-017] Estender o `AdminContentService` para conteúdo, formação, skills e contatos.
  - Arquivos/módulos: `src/app/features/admin/content-management/admin-content.service.ts`, `admin-content.models.ts` e componentes de gestão atuais.
  - Verificação: a Admin page carrega e salva campos em `pt-BR` e `en`, períodos, andamento, competências, conteúdos estudados, ícones e contatos; contatos usam uma única entidade; operações atuais de inserir/editar/excluir permanecem sem mudança não aprovada; retorno de erro não confirma alteração.

- [ ] T-009 [FR-011, FR-016, FR-017] Garantir consistência do estado original em falhas de persistência.
  - Arquivos/módulos: `admin-content.service.ts`, fluxo de estado da Admin page, eventual função SQL versionada se aprovada em T-001.
  - Verificação: simular falha em cada etapa de um salvamento relacionado; a UI não descarta o original, a página pública não recebe alteração não confirmada e, se a estratégia aprovada for transacional/compensatória, não ficam registros ou objetos novos órfãos.

## Fase 3 — Interface

- [ ] T-010 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-019] Ajustar header, títulos, numerações, apresentação inicial e largura de “About me”.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.ts`, `.html` e `.scss`.
  - Verificação: header continua fixo e com os mesmos destinos/ordem; numerações são removidas; apresentação mostra nome, posicionamento, resumo e contatos compactos; “About me” segue o critério aprovado; desktop e mobile permanecem utilizáveis.

- [ ] T-011 [FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-019] Conectar a página pública aos dados persistidos e aos fallbacks.
  - Arquivos/módulos: `portfolio-page.ts`, `.html`, `.scss` e `portfolio-content.service.ts`.
  - Verificação: skills aparecem por categoria; formação exibe instituição, curso, período, andamento, competências e conteúdos; experiências aparecem na ordem aprovada sem empresa; projetos aceitam novos registros sem alteração estrutural; contatos compactos e completos refletem o mesmo registro; locale alterna e ausência de tradução usa `pt-BR`.

- [ ] T-012 [FR-007, FR-008, FR-009, FR-013, FR-016, FR-017, FR-018] Atualizar os formulários e controles da Admin page.
  - Arquivos/módulos: `src/app/features/admin/content-management/content-management.ts`, `.html`, `.scss`, `admin-content.models.ts`, `admin-content.service.ts` e integração com `media-management/`.
  - Verificação: Marcos consegue editar/inserir os novos campos, selecionar os dois locales, cadastrar skill sem ícone, enviar ícone válido ou informar URL, editar formação e contatos e salvar projeto; arquivo acima de 1 MB é rejeitado; falha conserva os valores originais; exclusão atual continua funcional.

- [ ] T-013 [FR-004, FR-007, FR-011, FR-012, FR-013, FR-019] Implementar estados de mídia e responsividade.
  - Arquivos/módulos: componentes e estilos de `portfolio-page/`, `content-management/` e `media-management/`.
  - Verificação: imagem manual, URL válida, URL inválida e ausência de imagem produzem os estados aprovados; links de LinkedIn, GitHub, e-mail e telefone continuam funcionais; controles e cards permanecem utilizáveis em desktop e mobile.

## Fase 4 — Testes

- [ ] T-014 [FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-013, FR-014, FR-015, FR-017, FR-018] Completar testes unitários de serviços, modelos e validações.
  - Arquivos/módulos: specs de `portfolio/content/`, `admin/content-management/` e `admin/media-management/`.
  - Verificação: cobrir fallback `pt-BR`, idioma `en`, ordem mais recente, empresa ausente do DTO público, formação em andamento, skill sem ícone, URL com fallback manual, arquivo acima de 1 MB, contatos canônicos, falha de persistência e limpeza de upload órfão.

- [ ] T-015 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-010, FR-011, FR-012, FR-013, FR-014, FR-019] Completar testes de integração/regressão da página pública e Admin page.
  - Arquivos/módulos: `portfolio-page.spec.ts`, specs de `content-management/`, `media-management/` e `app.spec.ts`.
  - Verificação: header, âncoras, ordem das seções, ausência de numeração, largura de “About me”, duas posições de contato, alternância de idioma, novo projeto, empresa não exposta e operações existentes de inserir/editar/excluir passam sem regressão.

- [ ] T-016 [FR-007, FR-016, FR-017, FR-018] Validar migration, RLS e Storage em ambiente controlado.
  - Arquivos/módulos: migration nova, `supabase/`, evidências de `spec/05-verificacao/`.
  - Verificação: migration aplicada em ambiente de teste; `anon` não insere/atualiza conteúdo nem mídias; Marcos autorizado consegue salvar; limite de 1 MB é aplicado pelo cliente e pelo Storage/DB; rollback preserva os dados; nenhuma query manual substitui a migration versionada.

- [ ] T-017 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019] Executar a verificação por prioridade e registrar evidências.
  - Arquivos/módulos: `spec/05-verificacao/portfolio-publico-e-conteudo-administravel/`, aplicação publicada em preview controlado e scripts existentes.
  - Verificação: AC-001 a AC-015 rastreados; caminho feliz e erros de maior impacto executados em desktop e mobile; `npm test -- --watch=false --no-progress` e `npm run build` passam; regressão pública/admin e segurança são registradas; não marcar cenário não executado como aprovado.

## Fase 5 — Entrega

- [ ] T-018 [FR-001, FR-002, FR-005, FR-007, FR-010, FR-013, FR-017, FR-019] Revisar a convergência da Spec, plano, tarefas, código e testes.
  - Arquivos/módulos: `spec/03-features/portfolio-publico-e-conteudo-administravel/spec.md`, este plano, estas tarefas e evidências de `spec/05-verificacao/`.
  - Verificação: cada FR aponta para implementação e evidência; divergências são registradas; arquivos não relacionados permanecem fora do escopo; perguntas abertas não são decididas silenciosamente.

- [ ] T-019 [FR-007, FR-011, FR-016, FR-017, FR-018] Preparar o procedimento de deploy e rollback, sem executar publicação.
  - Arquivos/módulos: `spec/06-deploy/portfolio-publico-e-conteudo-administravel/deploy.md`, migration e evidências de verificação.
  - Verificação: procedimento descreve ordem migration → validação RLS/Storage → preview → smoke test → aprovação → promoção; inclui rollback de frontend e migration compensatória segura; nenhum comando remoto é executado nesta tarefa.

- [ ] T-020 [FR-001, FR-004, FR-013, FR-016, FR-017] Submeter a entrega para revisão e aprovação final de Marcos.
  - Arquivos/módulos: diff da feature, preview, evidências, plano de rollback e checklist de convergência.
  - Verificação: Marcos revisa o comportamento público, Admin page, sincronização de contatos, falhas e mídias; a tarefa só é marcada concluída após aprovação explícita; aprovação da implementação não implica autorização automática de deploy.

## Adiado (fora do escopo desta rodada)

- [ ] Executar deploy, promover preview ou aplicar migration no Supabase remoto.
- [ ] Criar backend próprio, Edge Function ou serviço externo fora do Supabase.
- [ ] Adicionar múltiplos administradores, workflow de rascunho ou CMS externo.
- [ ] Alterar a regra de exclusão administrativa sem uma decisão específica.
- [ ] Definir formatos adicionais de upload além do contrato aprovado.
- [ ] Refinar a identidade visual além dos ajustes necessários aos critérios desta feature.
