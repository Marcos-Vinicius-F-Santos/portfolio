# Plano de Implementação — Aprimoramento da Seção "Sobre mim"

Spec relacionada: `spec/03-features/aprimoramento-secao-sobre-mim/spec.md`  
Tarefas: `spec/04-plano/aprimoramento-secao-sobre-mim/tarefas.md`  

---

## 1. Visão Geral

Este plano organiza a implementação do design moderno e enriquecido da seção "Sobre mim" em quatro fases incrementais, assegurando compatibilidade com o sistema de internacionalização, a suíte de testes unitários existente e a esteira de build do Angular.

---

## 2. Fases de Execução

### Fase 1 — Modelos, Contratos de Cópia e Traduções
- Adicionar ao contrato `PortfolioCopy` os campos:
  - `aboutHeadline`: headline de impacto sobre a engenharia de software e arquitetura.
  - `aboutFocus`: linha de destaque com o foco técnico principal e tecnologias chave.
  - `aboutPillar1Title`, `aboutPillar1Description`: Front-end Engineering & Performance.
  - `aboutPillar2Title`, `aboutPillar2Description`: Backend & Enterprise Integrations.
  - `aboutPillar3Title`, `aboutPillar3Description`: Computer Vision & Intelligent Systems.
- Atualizar `ORIGINAL_COPY` em `portfolio-content.ts` (PT-BR) com a nova bio e pilares extraídos do currículo.
- Atualizar `ENGLISH_COPY` em `portfolio-translations.ts` (EN) com as respectivas traduções técnicas.

### Fase 2 — Sincronização de Snapshots Editoriais
- Executar `scripts/generate-joao-editorial-snapshot.mjs` para atualizar o snapshot `initial-editorial-snapshot-joao-v1.json` mantendo conformidade com o validador de snapshot.

### Fase 3 — Template e Estilos da Seção "Sobre mim"
- No template `portfolio-page.component.html`, refatorar o ramo da seção `sobre-mim` para exibir:
  - Header da seção com âncora e título acessível.
  - Headline de posicionamento técnico em tipografia Space Grotesk.
  - Parágrafos de narrativa bio e bloco de foco tecnológico.
  - Grid de 3 cards de pilares (`.about-pillars-grid`), cada um com seu ícone SVG Lucide estilizado, título e descrição.
- No arquivo de estilos `portfolio-page.component.css`:
  - Implementar o layout responsivo do grid (1 coluna em telas estreitas, 3 colunas em desktop).
  - Estilizar os cards com tokens de superfície bege (`var(--paper-strong)`), borda (`var(--line)`), cantos arredondados (`1rem`), sombra sutil e transições suaves de hover (`translateY(-4px)` e realce de borda caramelo/acento).

### Fase 4 — Verificação e Testes
- Executar e atualizar os testes unitários (`npm test -- --no-watch`).
- Executar a compilação de produção (`npm run build`).

