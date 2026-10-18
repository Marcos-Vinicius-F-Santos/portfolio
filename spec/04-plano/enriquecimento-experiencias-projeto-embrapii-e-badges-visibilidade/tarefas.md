# Tarefas — Enriquecimento do Portfólio via LinkedIn, 5º Projeto (EMBRAPII) e Badges de Visibilidade

Spec relacionada: `spec/03-features/enriquecimento-experiencias-projeto-embrapii-e-badges-visibilidade/spec.md`

## Regra das tarefas
Cada tarefa é atômica, implementada na ordem estipulada, referencia os requisitos da spec e só é considerada pronta após validação dos critérios de aceite.

---

## Fase 1 — Modelagem e Suporte aos Badges de Visibilidade

- [x] T-001 [FR-003, FR-004] Adicionar rótulos de visibilidade em `portfolio-ui-labels.ts` e suporte a visibilidade no modelo de dados.
  - Arquivos: `src/app/features/portfolio/services/portfolio-ui-labels.ts` e `src/app/features/portfolio/services/portfolio-content.models.ts`.
  - Labels adicionados:
    - `publicProject`: `"Público"` (PT) / `"Public"` (EN)
    - `privateProject`: `"Privado"` (PT) / `"Private"` (EN)
  - Modelo: `visibility?: 'public' | 'private'`.

- [x] T-002 [FR-003] Implementar o badge de visibilidade no componente `ProjectCardComponent`.
  - Arquivos: `src/app/shared/components/project-card/project-card.component.html`, `.css` e `.ts`.
  - Verificação: o card exibe badge sutil com ícone e texto de `Público` ou `Privado`.

- [x] T-003 [FR-004] Implementar o badge de visibilidade na página de detalhes `ProjectDetailComponent`.
  - Arquivos: `src/app/features/portfolio/pages/project-detail/project-detail.component.html` e `.css`.
  - Verificação: o cabeçalho da página de detalhes exibe o badge de visibilidade ao lado do tipo de projeto.

---

## Fase 2 — Enriquecimento das Experiências e 5º Projeto no Snapshot

- [x] T-004 [FR-001] Adicionar a entidade e listas do 5º projeto (*Plataforma de Gestão de Crédito e OCR — Polo EMBRAPII*) no snapshot.
  - Arquivo: `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json`.
  - Dados: tipo `professional`, visibilidade `private`, stack com `Java`, `Spring Boot`, `Python`, `OpenCV`, `OCR`, `MySQL`, `Docker`, `REST APIs`.
  - Traduções completas em `pt-BR` e `en`.

- [x] T-005 [FR-002] Atualizar as 4 experiências profissionais no snapshot com os dados ricos do LinkedIn.
  - Arquivo: `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json`.
  - SensorEng: Detecção de EPIs via IA, modularização lazy loading.
  - Polo EMBRAPII: Java, Spring Boot, microserviço OCR (Python/OpenCV), MySQL, Docker (período: mar/2024 - abr/2025).
  - Avante Soluções Digitais: Java, Spring, PrimeFaces, Hibernate, Oracle Database.
  - Polo IFMG: Flutter, Dart, SQLite, SharedPreferences, backend Laravel.

---

## Fase 3 — Regeneração do SQL e Verificação

- [x] T-006 [FR-005] Regenerar o script SQL de publicação no Supabase.
  - Arquivos: `spec/05-verificacao/joao-vitor/generate-publication-sql.mjs` e `spec/05-verificacao/joao-vitor/publicar_snapshot_joao_vitor.sql`.
  - Execução: `node spec/05-verificacao/joao-vitor/generate-publication-sql.mjs`.

- [x] T-007 [FR-003, FR-004, FR-005] Validar gate de white-label e suíte de testes unitários.
  - Execuções: `npm run check:white-label` e `npm test`.
  - Critério: Passar com código 0 e 100% dos testes sem regressão.

## Fase 4 — Refinamentos Visuais (Posição do Badge, Layout do Card e Ícones de Tecnologias)

- [x] T-009 [FR-004] Posicionar o badge de visibilidade (`Privado` / `Público`) no **topo direito** do cabeçalho na página de detalhes do projeto (`ProjectDetailComponent`).
  - Arquivo: `src/app/features/portfolio/pages/project-detail/project-detail.component.css`.
  - Ajuste: Configurar `.project-badges` com `width: 100%; justify-content: space-between;` para que o tipo do projeto fique à esquerda e o badge de visibilidade à direita.

- [x] T-010 [FR-006] Posicionar os chips de tecnologias imediatamente abaixo da descrição no card do projeto (`ProjectCardComponent`).
  - Arquivo: `src/app/shared/components/project-card/project-card.component.css`.
  - Ajuste: Remover `margin-top: auto` de `.project-card__technologies` (usando `margin-top: 0.25rem`) e mover `margin-top: auto` para `.project-card__footer`.

- [x] T-011 [FR-007] Criar ícones SVG dedicados para todas as tecnologias que estavam sem ícone próprio (`RxJS`, `Bootstrap`, `Chart.js`, `OpenLayers`, `CUDA`, `OCR`) e atualizar o mapeamento no frontend e no snapshot.
  - Arquivos:
    - `src/assets/skills/rxjs.svg`
    - `src/assets/skills/bootstrap.svg`
    - `src/assets/skills/chartjs.svg`
    - `src/assets/skills/openlayers.svg`
    - `src/assets/skills/cuda.svg`
    - `src/assets/skills/ocr.svg`
    - `src/app/features/portfolio/services/technology-icons.ts`
    - `src/app/features/portfolio/services/portfolio-content.ts`
    - `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json`
    - `spec/05-verificacao/joao-vitor/publicar_snapshot_joao_vitor.sql`

- [x] T-012 Portão de Aprovação de João Vitor.
  - Validar `npm run check:white-label`, `npm test` e `npm run build`, e apresentar o resultado completo para revisão antes de qualquer commit ou push para o GitHub.


