# Tarefas — Barra de Navegação Moderna e Header Flutuante

## Fase 1 — Lógica no TypeScript (`portfolio-page.component.ts`)
- [x] T001: Criar computed signal `brandMonogram` derivado dinamicamente de `copy().name`.
- [x] T002: Implementar signals de estado dos menus suspensos (`cvMenuOpen`, `languageMenuOpen`, `mobileMenuOpen`) e método de fechamento global.
- [x] T003: Implementar ScrollSpy reativo com detecção da seção ativa visível na viewport (`activeSectionId`).
- [x] T004: Implementar métodos de ação de download do currículo por idioma (`downloadCurriculum(locale)`).

## Fase 2 — Template HTML (`portfolio-page.component.html`)
- [x] T005: Substituir o header simples pela estrutura moderna com 3 blocos (Monograma, Pílulas com ScrollSpy, Ações de CV e Idioma).
- [x] T006: Integrar o menu suspenso de Download CV (Opção A: Português e Inglês).
- [x] T007: Integrar o menu discreto de seleção de idioma na barra superior, preservando seletores de teste.
- [x] T008: Adicionar botão de menu hambúrguer e painel móvel expansível para telas < 768px.

## Fase 3 — Estilização CSS Nativo (`portfolio-page.component.css`)
- [x] T009: Implementar container flutuante fixo com glassmorphism, blur e bordas sutis.
- [x] T010: Implementar visual de pílulas para links de navegação com indicador animado de seção ativa.
- [x] T011: Estilizar os dropdowns flutuantes de CV e Idioma com design escuro elegante.
- [x] T012: Estilizar a responsividade e o menu retrátil mobile.

## Fase 4 — Testes e Validação
- [x] T013: Atualizar e adicionar testes unitários para o novo header em `portfolio-page.component.spec.ts`.
- [x] T014: Executar a suíte de testes com `npm test` garantindo 100% de sucesso (158 testes aprovados).
- [x] T015: Validar a compilação de produção e budgets com `npm run build` (zero warnings/erros).

## Fase 5 — Documentação SDD e Deploy
- [x] T016: Criar checklist de convergência e procedimento de deploy.
- [x] T017: Atualizar `docs/alteracoes/explicacao-alteracoes.md`.
