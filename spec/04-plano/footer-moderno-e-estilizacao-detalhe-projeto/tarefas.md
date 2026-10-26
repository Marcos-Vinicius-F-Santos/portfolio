# Plano de Execução — Rodapé Moderno e Estilização da Página de Detalhes de Projetos

Spec relacionada: `spec/03-features/footer-moderno-e-estilizacao-detalhe-projeto/spec.md`  
Status: Implementado — Pronto para Revisão de João Vitor

---

## 1. Decomposição das Tarefas

### Fase 1 — Dicionários e Componente Compartilhado de Rodapé (Footer)
- [x] **T-001:** Adicionar labels de rodapé nos dicionários de UI (`allRightsReserved`, `designedAndEngineeredBy`) em `portfolio-translations.ts` e `portfolio-content.ts` (ou helper `getUiLabels`).
- [x] **T-002:** Criar o componente compartilhado `SiteFooterComponent` em `src/app/shared/components/site-footer/` com suporte a `brandMonogram`, `authorName`, ano corrente e layout responsivo inspirado no padrão Josias Broch.
- [x] **T-003:** Integrar `SiteFooterComponent` na página inicial (`portfolio-page.component.html` e `portfolio-page.component.ts`).

### Fase 2 — Topbar e Estilização da Página de Detalhes de Projetos (`project-detail`)
- [x] **T-004:** Atualizar `project-detail.component.html` e `project-detail.component.ts`:
  - Adicionar cabeçalho superior moderno (`.site-header`) com monograma dinâmico (`brandMonogram`), botão estilizado de voltar aos projetos (`← Voltar aos projetos` / `← Back to projects`) e dropdown de idioma discreto.
  - Integrar o `SiteFooterComponent` na base da página de detalhes.
- [x] **T-005:** Redesenhar `project-detail.component.css`:
  - Utilizar a paleta de cores e tipografia da home (`--paper`, `--ink`, `--paper-strong`, `--font-display`, `--font-sans`).
  - Estruturar as seções (Contexto, Solução, Papel, Tecnologias, Decisões Técnicas, Resultados, Galeria de Imagens e Links) em cartões elegantes, com espaçamento harmônico e compensação do header fixo.

### Fase 3 — Testes, Validação e Convergência
- [x] **T-006:** Atualizar e expandir testes unitários em `project-detail.component.spec.ts` e `portfolio-page.component.spec.ts` cobrindo o novo rodapé, cabeçalho e navegação.
- [x] **T-007:** Executar `npm test -- --watch=false` garantindo 100% de sucesso em toda a suíte.
- [x] **T-008:** Executar `npm run check:white-label` validando que nenhuma informação pessoal hardcoded foi introduzida.
- [x] **T-009:** Apresentar a entrega final para revisão de João Vitor.
