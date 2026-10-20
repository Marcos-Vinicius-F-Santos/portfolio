# Tarefas — Alinhamento Fiel dos Textos dos Projetos e Correção da Publicação Editorial

Spec relacionada: [`spec/03-features/alinhamento-textos-projetos-e-publicacao-editorial/spec.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/03-features/alinhamento-textos-projetos-e-publicacao-editorial/spec.md)  

---

## Fase 0 — Gate de Aprovação da Spec

- [x] **T-000:** Apresentação da Spec para João Vitor e alinhamento do escopo de correção de dados e fluxo de publicação. (Aprovado em 20/10/2026).

---

## Fase 1 — Correção no Frontend (`EditorialProjectDetailComponent`)

- [x] **T-001 [FR-002]:** Refatorar o método `saveList` em `src/app/features/admin/pages/editorial-project-detail/editorial-project-detail.component.ts`:
  - Comparar a quantidade de linhas recebidas com `list.ids`;
  - Chamar `saveField` / `set_translation` para os itens existentes;
  - Chamar `add_entity` com `kind: 'listItem'` para linhas novas;
  - Chamar `remove_entity` para itens apagados;
  - Atualizar a ordem das entidades no rascunho com segurança.
- [x] **T-002 [FR-003]:** Adicionar atalho visível de navegação para publicação na barra superior e no rodapé de `editorial-project-detail.component.html` (botão `"Revisar e Publicar Alterações ➔"` levando para `/admin/editor`), deixando transparente que o rascunho precisa de publicação para ir ao ar no site.

---

## Fase 2 — Publicação Direta do Snapshot no Supabase (Atualização Imediata dos Textos)

- [x] **T-003 [FR-001]:** Criar e rodar o script SQL de atualização do snapshot no Supabase ([`supabase/atualizar_textos_projetos_v4.sql`](file:///c:/Users/xjoao/Desktop/portfolio/supabase/atualizar_textos_projetos_v4.sql)):
  - Atualizar os textos de **Descrição**, **Contexto**, **Solução** e **Resultados** dos 6 projetos no rascunho (`portfolio_editorial.draft_entities`, `draft_translations`);
  - Remover a menção a `"nota máxima"` do projeto de boxe;
  - Atualizar os dados dos 5 demais projetos com o texto auditado exato;
  - Invocar `portfolio_editorial.build_publication_content()` e publicar o novo snapshot ativo, sincronizando a tabela pública e o site público instantaneamente.

---

## Fase 3 — Verificação e Testes

- [x] **T-004:** Executar suíte completa de testes unitários (`npm test -- --watch=false`) — 193 testes aprovados.
- [ ] **T-005:** Executar no Supabase SQL Editor o script de atualização do snapshot e verificar no navegador em `http://localhost:4200/projetos/pipeline-visao-computacional-boxe` se os resultados estão sem "nota máxima" e com os textos corretos nos 6 projetos.
- [x] **T-006:** Registrar as alterações em `docs/alteracoes/` e aguardar aprovação de João Vitor antes de deploy.
