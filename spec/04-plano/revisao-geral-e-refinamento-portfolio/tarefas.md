# Tarefas — Revisão Geral, Saneamento de Dados e Refinamento Profissional do Portfólio

Spec relacionada: [`spec/03-features/revisao-geral-e-refinamento-portfolio/spec.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/03-features/revisao-geral-e-refinamento-portfolio/spec.md)  
Registro de alterações: [`docs/alteracoes/registro-2026-10-18-alinhamento-curriculo-e-editorial.md`](file:///c:/Users/xjoao/Desktop/portfolio/docs/alteracoes/registro-2026-10-18-alinhamento-curriculo-e-editorial.md)

---

## Fase 0 — Alinhamento e Aprovação da Spec (Gate Inicial)

- [x] **T-000:** Resolver as 5 perguntas abertas da Spec com João Vitor e obter aprovação antes de iniciar alterações de código ou banco.

---

## Fase 1 — Saneamento de Catálogos, Fallbacks e UI no Front-end

- [x] **T-001 [FR-001]:** Atualizar `portfolio-content.ts`, `portfolio-translations.ts` e `portfolio-ui-labels.ts`:
  - Adicionar `skillsComputerVisionLabel` (`"Visão Computacional"` / `"Computer Vision"`);
  - Remover `React` e `Node.js` de `PORTFOLIO_SKILL_CATEGORIES`;
  - Criar a categoria `computer-vision` com `['OpenCV', 'YOLOv8', 'MediaPipe', 'OCR']` e manter `version-control` com `['Git', 'GitHub', 'GitLab', 'GitKraken']`;
  - Adicionar `personalProjectSingular` e `professionalProjectSingular` em `portfolio-ui-labels.ts`.
- [x] **T-002 [FR-004, FR-005]:** Atualizar `ProjectCardComponent` e `ProjectDetailComponent`:
  - Usar `Router` para navegação SPA sem reload de página e habilitar `withInMemoryScrolling` em `app.config.ts`;
  - Exibir o `label` real do link externo no badge da capa em vez de `"Demo"` fixo;
  - Exibir o badge de categoria no singular (`"Projeto Pessoal"` / `"Projeto Profissional"`) na tela de detalhe.
- [x] **T-003 [FR-006]:** Implementar atualização dinâmica de `<title>` e meta tag `description` (`og:title`, `og:description`) em `PortfolioPageComponent` e `ProjectDetailComponent` mantendo fallback 100% White-Label.

---

## Fase 2 — Saneamento do Banco de Dados Editorial (Supabase SQL)

- [x] **T-004 [FR-001, FR-002, FR-003]:** Gerar e validar script SQL consolidado ([`supabase/sql/20261018_editorial_refinement_and_alignment.sql`](file:///c:/Users/xjoao/Desktop/portfolio/supabase/sql/20261018_editorial_refinement_and_alignment.sql)) contemplando:
  - Atualização da data de término de *Gestão de Crédito* (`2025-03-31`) e uniformização de *Avante Sistemas* (PT e EN);
  - Remoção de `skill-react` e `skill-node-js`, criação da categoria `computer-vision` (`copy-skillsComputerVisionLabel`) e de `skill-ocr`, e realocação de `skill-opencv`, `skill-yolov8` e `skill-mediapipe`;
  - Expansão e contextualização das siglas (`SUAP`, `CNH`, `CRLV`, `EMBRAPII`, `HLS`, `RBAC`, `JCUKEN`, `ROIs`, `FSM`, `JSF`) em `pt-BR` e `en`;
  - Compilação da nova revisão e publicação imutável via `portfolio_editorial.build_publication_content()`.

---

## Fase 3 — Testes, Verificação e Portão Final

- [x] **T-005:** Atualizar e criar testes unitários cobrindo as alterações em `portfolio-content.spec.ts`, `portfolio-page.component.spec.ts`, `project-card.component.spec.ts` e `project-detail.component.spec.ts`.
- [x] **T-006:** Executar gates de qualidade (`npm run check:white-label`, `npm test -- --watch=false`, `npm run build`).
- [x] **T-007:** Atualizar registro em `docs/alteracoes/` e concluir commit/push após aprovação de João Vitor.

