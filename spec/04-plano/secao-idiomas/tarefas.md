# Tarefas de Implementação — Seção de Idiomas

Status: Proposta  
Spec: `spec/03-features/secao-idiomas/spec.md`  
Plano: `spec/04-plano/secao-idiomas/plano.md`

---

- [ ] **T-001 [FR-001, FR-002, FR-005] Modelagem de dados e contratos de conteúdo**
  - Adicionar interface `PortfolioLanguageEntry` e constantes de fallback em `src/app/features/portfolio/content/portfolio-content.models.ts` e `portfolio-content.ts`.
  - Adicionar chaves de tradução `languagesTitle` e `languagesBody` em `ORIGINAL_COPY` e `ENGLISH_COPY`.
  - *Critério de aceite*: Compilação limpa dos tipos e contratos.

- [ ] **T-002 [FR-005] Suporte no validador e adaptador do snapshot editorial**
  - Adicionar section kind `'languages'` e entity kind `'language'` em `editorial-snapshot.models.ts` e `editorial-snapshot.validator.ts`.
  - Implementar e testar `snapshotToLanguages()` em `editorial-snapshot-adapter.ts`.
  - *Critério de aceite*: Testes unitários do validador e adaptador passam com sucesso.

- [ ] **T-003 [FR-003, FR-005] Serviços de conteúdo (leitor do snapshot e fallback)**
  - Implementar `listLanguages(locale)` em `PortfolioContentService` e `PublishedSnapshotContentService`.
  - Atualizar gerador `scripts/generate-joao-editorial-snapshot.mjs` para incluir os 4 idiomas e regenerar o snapshot JSON.
  - *Critério de aceite*: `service.listLanguages('pt-BR')` e `service.listLanguages('en')` retornam os 4 idiomas traduzidos.

- [ ] **T-004 [FR-001, FR-002, FR-004, FR-006] UI do Portfólio Público (Template, Estilos e Navegação)**
  - Adicionar sinal `languages` em `portfolio-page.ts` e carregá-lo no ciclo de inicialização/troca de idioma.
  - Adicionar a seção `#idiomas` no template `portfolio-page.html` e o item no menu de navegação `navigationItems`.
  - Criar estilos em `portfolio-page.scss` (grid responsivo com cards para cada idioma).
  - *Critério de aceite*: Seção renderiza os 4 idiomas com níveis em mobile e desktop nos dois idiomas da UI.

- [ ] **T-005 [AC-005] Testes automatizados e regressão**
  - Atualizar `portfolio-page.spec.ts` com testes cobrindo a exibição, navegação e troca de idioma da nova seção.
  - Executar suíte completa (`npm test`) e garantir 100% de sucesso.
  - *Critério de aceite*: Todos os testes passam sem falhas.

- [ ] **T-006 [FR-005] Script de migration / atualização do Supabase**
  - Gerar script SQL para atualizar o snapshot e publicações ativas no Supabase com os dados da nova seção de idiomas.
  - *Critério de aceite*: Script SQL pronto para aplicação no Supabase Studio.
