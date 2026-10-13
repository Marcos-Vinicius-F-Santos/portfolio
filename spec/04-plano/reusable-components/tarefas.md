# Tarefas — Componentes reutilizáveis do painel administrativo

Plano relacionado: `spec/04-plano/reusable-components/plano.md`

## Regra das tarefas

Cada tarefa é pequena o suficiente para revisar de uma vez, referencia o requisito que
implementa e descreve como verificar que ficou pronta. A spec e o plano estão aprovados, mas
as tarefas permanecem pendentes até o início autorizado da implementação.

## Fase 1 — Base

- [x] T-001 [FR-005] Definir os tokens e mixins administrativos compartilhados.
  - Arquivos/módulos: `src/app/shared/ui/admin-ui.scss`
  - Verificação: confirmar que os tokens cobrem campos, botões, feedback e cópia auxiliar sem alterar o portfólio público.

- [x] T-002 [FR-001] Criar `AdminPageHeader` com eyebrow, título, descrição e ações projetadas.
  - Arquivos/módulos: `src/app/shared/ui/admin-page-header/`
  - Verificação: teste unitário confirma a renderização dos dados e da ação projetada.

## Fase 2 — Lógica principal

- [x] T-003 [FR-002] Criar `AdminSectionHeader` com descrição opcional e ações projetadas.
  - Arquivos/módulos: `src/app/shared/ui/admin-section-header/`
  - Verificação: teste unitário confirma que a descrição opcional e a ação são projetadas.

- [x] T-004 [FR-003] Criar `AdminFeedback` para status, erro e sucesso.
  - Arquivos/módulos: `src/app/shared/ui/admin-feedback/`
  - Verificação: teste unitário confirma variantes, `role` de erro e preservação de `data-testid`.

- [x] T-005 [FR-004] Criar `AdminCard` com variantes padrão, imagem e tracejada.
  - Arquivos/módulos: `src/app/shared/ui/admin-card/`
  - Verificação: teste unitário confirma projeção do conteúdo e aplicação da variante selecionada.

## Fase 3 — Interface

- [x] T-006 [FR-001, FR-002, FR-003, FR-004, FR-005] Migrar o gerenciamento de conteúdo para os componentes compartilhados.
  - Arquivos/módulos: `src/app/features/admin/content-management/`
  - Verificação: teste existente continua encontrando as áreas de conteúdo, mensagens e controles.

- [x] T-007 [FR-001, FR-002, FR-003, FR-004, FR-005] Migrar o gerenciamento de mídias e preservar a responsividade dos cartões de imagem.
  - Arquivos/módulos: `src/app/features/admin/media-management/`
  - Verificação: teste existente continua encontrando projetos, imagens, idiomas e mensagens.

## Fase 4 — Testes

- [x] T-008 [FR-001, FR-002, FR-003, FR-004] Cobrir os caminhos felizes e o erro mais óbvio dos componentes compartilhados.
  - Arquivos/módulos: testes dos diretórios `src/app/shared/ui/*/`
  - Verificação: `npm test -- --watch=false --no-progress` passa sem falhas.

- [x] T-009 [FR-005] Verificar a compilação e a ausência de problemas de formatação no diff.
  - Arquivos/módulos: projeto inteiro
  - Verificação: `npm run build` e `git diff --check` passam.

## Fase 5 — Entrega

- [x] T-010 Atualizar/checar o procedimento de deploy e rollback.
  - Arquivos/módulos: `spec/03-features/reusable-components/spec.md`, `spec/04-plano/reusable-components/plano.md`
  - Verificação: apresentar diff e resultados ao Marcos; não fazer commit, push ou deploy sem autorização.

## Adiado (fora do escopo desta rodada)

- [ ] Extrair cartões do portfólio público.
- [ ] Criar componentes genéricos de campos de formulário.
- [ ] Criar um cartão universal para domínios administrativos e públicos.
