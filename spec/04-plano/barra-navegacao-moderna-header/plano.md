# Plano de Implementação — Barra de Navegação Moderna e Header Flutuante

Feature: Barra de Navegação Moderna e Header Flutuante  
Spec: `spec/03-features/barra-navegacao-moderna-header/spec.md`  
Decisão Arquitetural: `spec/02-arquitetura/DECISAO-016-barra-navegacao-moderna-header.md`  
Status: Em Planejamento  
Data: 2026-10-13  

---

## 1. Estratégia de Implementação

A implementação será executada em fases incrementais diretamente em `src/app/features/portfolio/pages/portfolio-page/` e serviços de apoio, preservando toda a suíte de testes existente e a integridade dos sinais do Angular 22.

---

## 2. Fases de Execução

### Fase 1: Sinais e Lógica de Apoio no TypeScript
1. Criar computed signal `brandMonogram` derivado de `copy().name` (extrai as duas primeiras iniciais ou letras capitais + `.dev`).
2. Implementar signals e métodos para controle dos menus suspensos:
   - `cvMenuOpen = signal(false)` e `toggleCvMenu()`
   - `languageMenuOpen = signal(false)` e `toggleLanguageMenu()`
   - `mobileMenuOpen = signal(false)` e `toggleMobileMenu()`
3. Adicionar lógica de fechamento global ao clicar fora (`document:click`) ou pressionar `Escape`.
4. Implementar detecção de seção ativa (`activeSectionId`) com `IntersectionObserver` ou rastreio de rolagem.
5. Implementar método para download/abertura do currículo por idioma (`downloadCurriculum(locale)`).

### Fase 2: Estrutura HTML do Novo Header Flutuante
1. Reestruturar a tag `<header class="site-header">`:
   - Bloco esquerdo: Monograma interativo com iniciais em destaque.
   - Bloco central: Navegação horizontal com classes de seção ativa e traço animado.
   - Bloco direito:
     - Botão Dropdown "Download CV" com menu flutuante para Português e Inglês.
     - Botão Dropdown discreto de Idioma com opções PT-BR / EN.
     - Botão de Menu Hambúrguer para resoluções mobile.
   - Painel móvel retrátil para telas menores.
2. Remover o elemento `<label class="language-control">` antigo do cabeçalho da página (`page-header`), mantendo compatibilidade com testes que buscam `[data-testid="language-select"]`.

### Fase 3: Estilos CSS Nativo (Glassmorphism & Pílulas)
1. Estilizar a barra flutuante com posição fixa, fundo translúcido escuro, bordas suaves e `backdrop-filter: blur(12px)`.
2. Estilizar as pílulas de navegação, efeitos de hover e indicador animado da seção ativa (`activeSectionId`).
3. Estilizar os menus suspensos flutuantes (*dropdowns*) com sombras elegantes, cantos arredondados e transições de opacidade.
4. Ajustar responsividade para mobile (< 768px).

### Fase 4: Testes e Validação
1. Atualizar e criar testes unitários para o novo header em `portfolio-page.component.spec.ts`.
2. Rodar a suíte completa com `npm test` garantindo 100% de sucesso.
3. Rodar `npm run build` validando budgets de script e CSS.

### Fase 5: Documentação de Verificação e Deploy
1. Criar `checklist-convergencia.md` e `deploy.md`.
2. Atualizar documentação em `docs/alteracoes/`.

