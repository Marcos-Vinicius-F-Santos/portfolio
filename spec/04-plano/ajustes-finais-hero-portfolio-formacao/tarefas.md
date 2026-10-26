# Plano de Execução — Ajustes Finais no Hero, Portfólio com Fallback e Remoção de Formação

Spec relacionada: `spec/03-features/ajustes-finais-hero-portfolio-formacao/spec.md`  
Status: Em Planejamento / Execução

---

## 1. Decomposição das Tarefas

### Fase 1 — Modelos, Fallbacks e Runtime Config
- [x] **T-001:** Definir `PORTFOLIO_PROJECTS` (com Russian Mastery e Boxing CV Pipeline) e fallback de experiências em `portfolio-content.ts`, exportando-os com suporte a PT-BR e EN.
- [x] **T-002:** Atualizar `ORIGINAL_COPY.heroName`, `ORIGINAL_COPY.name`, `ENGLISH_COPY.heroName` e `ENGLISH_COPY.name` para `"João Vitor"`.
- [x] **T-003:** Atualizar `scripts/generate-runtime-config.mjs` para injetar `authorName: process.env.PORTFOLIO_AUTHOR_NAME ?? 'João Vitor'` e sincronizar `src/app/core/config/supabase-runtime-config.ts`.
- [x] **T-004:** Atualizar `PortfolioContentService.listProjects()` e `PublishedSnapshotContentService.listProjects()` para retornarem os projetos de fallback quando não houver snapshot ou client Supabase disponível.

### Fase 2 — Ajuste dos Componentes de Visualização (Home)
- [x] **T-005:** Atualizar `PortfolioPageComponent` (`portfolio-page.component.ts`):
  - Inicializar `this.projects` com os projetos de fallback para exibição imediata sem layout shift.
  - Atualizar o fallback de `authorName` de `"Desenvolvedor de Software"` para `"João Vitor"`.
  - Remover `educationTitle` / `formacao-academica` de `navigationItems()`.
- [x] **T-006:** Atualizar `portfolio-page.component.html`:
  - Remover o bloco `@else if (item.targetId === 'formacao-academica')` da iteração de seções verticais.
- [x] **T-010:** Remover o parágrafo `.portfolio-subtitle` de `portfolio-page.component.html` e remover a linha divisória horizontal (`border-top: 1px solid var(--line)`) de `section` em `portfolio-page.component.css`.
- [x] **T-011:** Padronizar espaçamentos verticais das seções e topo em `portfolio-page.component.css` utilizando flexbox/gap uniforme no container `.sections`, eliminando `min-height` desnecessário e zerando `margin-top` redundante em `section h2`.
- [x] **T-012:** Ocultar o botão com `symbol === 'email'` de `.compact-contact-links` no Hero (`heroContactLinks`), mantendo-o visível na seção `#contato`.
- [x] **T-013:** Remover o sufixo ` · Remote` / ` · Remoto` de `heroAvailability` em `portfolio-content.ts`, `portfolio-translations.ts` e `portfolio-page.component.ts`.
- [x] **T-014:** Adicionar `target="_blank"` e `rel="noopener noreferrer"` nos links `.compact-contact-link` do Hero e nos links de download de currículo.

### Fase 3 — Testes, Validação e Convergência
- [x] **T-007:** Atualizar `portfolio-page.component.spec.ts` e serviços relacionados:
  - Ajustar asserções de contagem de links de navegação (de 6 para 5 ou 6 com portfolio ativo).
  - Verificar que o Hero H1 contém o nome esperado.
  - Verificar que `#portfolio` é renderizado sem `.portfolio-subtitle` e `#formacao-academica` não é renderizado.
- [x] **T-008:** Executar a suíte de testes unitários (`npm test`) e garantir 100% de sucesso.
- [x] **T-009:** Executar o build de produção (`npm run build`).

