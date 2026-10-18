# Tarefas — Placeholder Visual com Cadeado e Identificação de Código Proprietário nos Cards de Projetos

Spec relacionada: `spec/03-features/thumbnails-cadeado-projetos-privados/spec.md`

## Regra das tarefas
Cada tarefa é atômica, implementada na ordem estipulada, referencia os requisitos da spec e só é considerada pronta após validação dos critérios de aceite.

---

## Fase 1 — Rótulos Bilíngues no UI Service

- [x] T-001 [FR-001] Adicionar rótulos `proprietaryCode` e `openSourceCode` em `portfolio-ui-labels.ts`.
  - Arquivo: `src/app/features/portfolio/services/portfolio-ui-labels.ts`.
  - Português: `"Código Proprietário"` e `"Código Aberto"`.
  - Inglês: `"Proprietary Code"` e `"Open Source"`.

---

## Fase 2 — Implementação no Componente `ProjectCardComponent`

- [x] T-002 [FR-002, FR-003, FR-004] Atualizar template HTML para alternar entre cadeado (privado) e código aberto (público) no placeholder central.
  - Arquivo: `src/app/shared/components/project-card/project-card.component.html`.
  - Exibir ícone SVG de cadeado e texto `ui().proprietaryCode` quando `projectVisibility() === 'private'`.
  - Exibir ícone `< >` e texto `ui().openSourceCode` quando `projectVisibility() === 'public'`.

- [x] T-003 [FR-002, FR-003] Atualizar estilos CSS para o glow, ícone de cadeado e tipografia da legenda do placeholder.
  - Arquivo: `src/app/shared/components/project-card/project-card.component.css`.
  - Estilizar `.project-card__placeholder-label` com tipografia mono/sans elegante, uppercase e letter-spacing.
  - Ajustar o glow central para refletir tons quentes/âmbar para privado e verde suave para público.

- [x] T-007 [FR-006] Remover a barra superior estilo janela de navegador (`.project-card__window-bar`).
  - Arquivos: `src/app/shared/components/project-card/project-card.component.html` e `.css`.
  - Remover a `<div>` com os 3 dots e o título da janela, fazendo o card começar diretamente pela capa.
  - Limpar as regras CSS órfãs (`.project-card__window-bar`, `.project-card__dots`, `.project-card__dot`, `.project-card__window-title`).

---

## Fase 3 — Testes Unitários e Verificação

- [x] T-004 [FR-005] Atualizar suíte de testes unitários em `project-card.component.spec.ts`.
  - Arquivo: `src/app/shared/components/project-card/project-card.component.spec.ts`.
  - Testar renderização do cadeado e do rótulo para projeto privado sem capa.
  - Testar renderização do ícone de código aberto para projeto público sem capa.
  - Testar que imagem real se sobrepõe ao placeholder quando presente.

- [x] T-005 [FR-005] Executar gates de validação.
  - `npm run check:white-label`
  - `npm test -- --watch=false`
  - `npm run build`

- [x] T-006 Portão de Aprovação de João Vitor.
  - Apresentado o resultado visual e de código antes de qualquer commit ou push para o GitHub; aprovado para subida.

