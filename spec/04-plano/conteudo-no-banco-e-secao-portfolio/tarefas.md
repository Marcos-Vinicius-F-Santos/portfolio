# Plano de Tarefas: Conteúdo no Banco e Seção Portfólio

Este documento detalha o checklist de execução e o progresso incremental da feature especificada em `spec/03-features/conteudo-no-banco-e-secao-portfolio/spec.md`.

## Fase 0 — Linha de Base e Consolidação
- [x] **T-001:** Consolidar e commitar alterações locais anteriores em Sobre mim, Habilidades e Contato (`596416e`).
- [x] **T-002:** Importar foto `linkedin.jpg` para `src/assets/profile/joao-vitor.jpg` com moldura estilizada (`ce2a87b`).

## Fase 1 — Parte A: Conteúdo no Banco e Isolamento White-Label
- [x] **T-003:** Criar dicionário de interface T2 tipado `portfolio-ui-labels.ts` (`01639aa`).
- [x] **T-004:** Neutralizar fallbacks estáticos em `portfolio-content.ts` e `portfolio-translations.ts` mantendo isolamento white-label (`0c50b24`).
- [x] **T-005:** Adicionar chaves T1 de hero e portfólio a `PortfolioCopy` com atributos `data-editorial-*` (`0c50b24`).
- [x] **T-006:** Criar migration idempotente `supabase/migrations/20261014120000_add_hero_and_portfolio_editorial_keys.sql` (`71bad63`).
- [x] **T-007:** Atualizar scripts de seed de João Vitor (`scripts/generate-joao-editorial-snapshot.mjs` e `supabase/setup_editorial_joao_vitor.sql`) com conteúdo e traduções em inglês (`71bad63`).

## Fase 2 — Parte B: Seção Portfólio em Cards
- [x] **T-008:** Criar componente isolado `ProjectCardComponent` com aspect-ratio 16:10, fallback CSS/SVG placeholder, botões de ação rápida e badges de tecnologia (`4e0c7db`).
- [x] **T-009:** Atualizar `PortfolioPageComponent` template e estilos para renderizar `#portfolio` com grid de cards e abas de filtro ("Todos", "Profissionais", "Pessoais").
- [x] **T-010:** Atualizar helper `hasPortfolioProjectCardContent` em `portfolio-content.models.ts` para relaxar regra de 8 campos na home.
- [x] **T-011:** Remover seção `#resultados-profissionais` e seu item de navegação da home, preservando dados para uso futuro nas páginas de detalhe.
- [x] **T-012:** Criar migration no Supabase para bucket `project-images` suportar `image/webp` e limite de 3 MB.

## Fase 3 — Validação, Testes e Documentação
- [x] **T-013:** Atualizar testes unitários (`portfolio-page.component.spec.ts`) cobrindo novos cards, filtros e ausência de resultados na home.
- [x] **T-014:** Executar validação completa com `npm test` (176 testes passando) e `npm run build` (chunk inicial 469.32 kB < 500 kB).
- [x] **T-015:** Documentar alterações de arquitetura em `spec/02-arquitetura/DECISAO-019-conteudo-no-banco-e-secao-portfolio.md`.
- [x] **T-016:** Atualizar `spec/05-verificacao/conteudo-no-banco-e-secao-portfolio/verificacao.md`.
- [ ] **T-017:** Apresentar relatório de conclusão e solicitar aprovação de João Vitor.
