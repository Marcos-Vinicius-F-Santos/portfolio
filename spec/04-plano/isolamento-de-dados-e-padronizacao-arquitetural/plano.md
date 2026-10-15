# Plano de Implementação — Isolamento de Dados e Padronização Arquitetural

Spec relacionada: `spec/03-features/isolamento-de-dados-e-padronizacao-arquitetural/spec.md`  
Decisão arquitetural: `spec/02-arquitetura/DECISAO-015-isolamento-de-dados-pessoais-padronizacao-e-performance.md`  
Tarefas: `spec/04-plano/isolamento-de-dados-e-padronizacao-arquitetural/tarefas.md`

## 1. Visão Geral

Este plano organiza as fases para transformar a base de código em uma solução white-label, onde nenhum dado pessoal reside estaticamente no código versionado, consolidar a estrutura de pastas conforme a DECISAO-013 e implementar lazy loading nas rotas principais do Angular.

---

## 2. Ordem Incremental de Execução

1. **Fase 1 — Padronização e Movimentação de Pastas**:
   - Mover `contact-panel` de `src/app/features/portfolio/presentation/` para `src/app/shared/components/contact-panel/`.
   - Renomear arquivos para `contact-panel.component.ts`, `.html`, `.css`, `.spec.ts`.
   - Mover `admin-card`, `admin-feedback`, `admin-page-header`, `admin-section-header` de `src/app/shared/ui/` para `src/app/shared/components/`.
   - Renomear para `*.component.ts`, `*.component.html`, `*.component.css`, `*.component.spec.ts`.
   - Atualizar caminhos de importação nos consumidores e specs.
   - Remover pastas legadas `presentation/` e `ui/`.

2. **Fase 2 — Neutralização de Dados Estáticos (White-Label)**:
   - Em `portfolio-content.ts`: neutralizar `PORTFOLIO_CONTACT_LINKS`, `ORIGINAL_COPY`, `PORTFOLIO_ACADEMIC_ENTRIES`.
   - Em `portfolio-translations.ts`: neutralizar `ENGLISH_COPY`.
   - Em `contact-panel.models.ts`: definir `DEFAULT_CONTACT_PANEL_DESTINATIONS` como `{ whatsappNumber: '', email: '' }`.
   - Em `portfolio-page.component.ts`: calcular `contactDestinations` dinamicamente a partir dos canais retornados pelo Supabase.
   - Em `index.html`: definir título neutro `<title>Portfólio Profissional</title>` e atributo `lang="pt-BR"`.
   - Remover arquivos duplicados de currículo em `public/` (`Curriculum.pdf`, `Currículo.pdf`).

3. **Fase 3 — Lazy Loading Universal de Rotas**:
   - Em `app.routes.ts`: converter `PortfolioPageComponent`, `AdminWorkspaceComponent` e `AdminAuthenticationComponent` para `loadComponent: () => import(...)`.

4. **Fase 4 — Desacoplamento da Suíte de Testes**:
   - Ajustar asserções nos testes unitários que procuravam por strings literais de autores (`app.component.spec.ts`, `portfolio-page.component.spec.ts`, `contact-panel.component.spec.ts`, `initial-editorial-snapshot-joao.spec.ts`).
   - Silenciar ruídos no console durante testes de falha controlada.

5. **Fase 5 — Verificação e Convergência**:
   - Executar `npm test` para assegurar 100% de sucesso nos testes.
   - Executar `npm run build` para validar compilação limpa e respeito ao orçamento de tamanho.
   - Gerar documentação de encerramento em `spec/05-verificacao/` e `spec/06-deploy/`.
