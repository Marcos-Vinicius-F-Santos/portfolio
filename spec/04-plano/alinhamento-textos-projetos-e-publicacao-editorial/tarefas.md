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

- [x] **T-003 [FR-001]:** Criar e validar o script SQL de atualização do snapshot no Supabase ([`supabase/atualizar_textos_projetos_v5.sql`](file:///c:/Users/xjoao/Desktop/portfolio/supabase/atualizar_textos_projetos_v5.sql)):
  - Atualizar os textos de **Título**, **Descrição**, **Contexto**, **Papel**, **Solução**, **Decisões Técnicas**, **Aprendizados** e **Resultados** dos 6 projetos no rascunho (`portfolio_editorial.draft_entities`, `draft_translations`);
  - Remover definitivamente do projeto Avante ERP a alegação indevida sobre consultas N+1 e bloqueios de concorrência, substituindo por `"Utilização de Hibernate e Java Persistence API (JPA) para mapeamento objeto-relacional e persistência de dados."`;
  - Expandir todas as siglas na 1ª ocorrência visual de cada rota e card (EPIs, IoT, RBAC, HLS, OCR, IFMG, EMBRAPII, API, SUAP, SSID, HTML, ERP, JSF, SQL, JPA, SM-2, YOLOv8, ROIs, FSM, TCC, GPU, CUDA);
  - Adicionar o 5º item de decisão técnica em Russian Mastery (Docker Compose);
  - Sincronizar as traduções em inglês (`en`) fiéis aos textos aprovados;
  - Utilizar dollar-quoting (`$migration$` e `$snapshot$`) para evitar erros de sintaxe decorrentes de apóstrofos em inglês.

---

## Fase 3 — Verificação e Testes

- [x] **T-004:** Executar suíte completa de testes unitários (`npm test -- --watch=false`) — 193 testes aprovados.
- [x] **T-005:** Validar estrutura do snapshot gerado com o validador oficial (`validateEditorialSnapshot`) — 0 erros.
- [ ] **T-006:** Executar no Supabase SQL Editor o script de atualização do snapshot ([`supabase/atualizar_textos_projetos_v5.sql`](file:///c:/Users/xjoao/Desktop/portfolio/supabase/atualizar_textos_projetos_v5.sql)) e confirmar persistência no banco e na URL publicada.
- [x] **T-007:** Registrar as alterações em `docs/alteracoes/` e gerar relatório de convergência completo no formato JSON solicitado.
