# Tarefas — Estilização Moderna da Seção de Habilidades

Plano relacionado: `spec/04-plano/estilizacao-habilidades-estilo-josias/plano.md`  
Spec relacionada: `spec/03-features/estilizacao-habilidades-estilo-josias/spec.md`  

---

## Fase 1 — Catálogo e Contratos
- [x] T-001 [FR-003] Atualizar `PORTFOLIO_SKILL_CATEGORIES` em `src/app/features/portfolio/services/portfolio-content.ts` incluindo tecnologias de contato real (`MediaPipe`, `Redis`) preservando todos os itens validados em testes.

## Fase 2 — Estilização da Seção de Habilidades
- [x] T-002 [FR-001, FR-002] Atualizar `portfolio-page.component.css`:
  - Configurar `.skills-grid` para disposição vertical espaçada de categorias.
  - Tornar `.skill-category` um grupo aberto e sem moldura caixa rígida.
  - Estilizar títulos `h3` das categorias com visual limpo em caixa alta e tracking.
  - Configurar a grade de cards `ul` com `grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr))`.
  - Estilizar `.skill-item` como card moderno arredondado com ícone no topo e texto centralizado abaixo.
  - Adicionar efeitos de hover de elevação e realce de borda.

## Fase 3 — Verificação e Testes
- [x] T-003 [AC-001 até AC-004] Executar suíte de testes unitários (`npm test -- --no-watch`).
- [x] T-004 Executar build de produção (`npm run build`).

## Fase 4 — Ampliação de Proporções e Remoção de Subtítulo Geral
- [x] T-005 Remover parágrafo `.skills-subtitle` de `#stack-tecnica` em `portfolio-page.component.html`.
- [x] T-006 Aumentar dimensões dos cards (`.skill-item`), ícones (`img`) e subtítulos de categoria (`.skill-category h3`) em `portfolio-page.component.css`.
- [x] T-007 Executar testes e build de produção.
