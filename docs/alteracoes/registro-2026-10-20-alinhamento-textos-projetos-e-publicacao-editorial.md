# Registro de Alterações — 20/10/2026: Alinhamento de Textos dos Projetos e Publicação Editorial

## 1. Motivação e Contexto
- Durante a edição dos 6 projetos no painel administrativo (`/admin/editor/projetos/:id`), foi identificado que a adição/remoção de itens em listas (`Resultados`, `Decisões Técnicas`, etc.) não sincronizava adequadamente quando o tamanho da lista variava, e o usuário precisava de um caminho explícito para publicar o rascunho em produção.
- Ao tentar rodar o script SQL gerado para forçar a publicação imediata do snapshot atualizado, ocorreu o erro PostgreSQL `42601: trailing junk after numeric literal at or near "3f6fa6a5"`.

## 2. Diagnóstico e Causa Raiz
1. **Erro de SQL `42601`**:
   - O payload JSON embutido no script continha apóstrofos em inglês (ex: `Bachelor's Thesis`, `driver's licenses`).
   - Como o payload estava delimitado por aspas simples normais `'...'`, o apóstrofo fechava prematuramente o literal de string no PostgreSQL, fazendo com que o restante da linha fosse interpretado como SQL inválido.
   - **Solução**: Uso de Dollar-Quoting (`$snapshot${...}$snapshot$::jsonb;` aninhado dentro do bloco `do $migration$ ... end $migration$;`).
2. **Frontend `saveList`**:
   - `EditorialProjectDetailComponent.saveList()` utilizava `Math.min(ids.length, next.length)` para iterar, ignorando linhas adicionadas ou removidas.
   - **Solução**: Refatoração completa de `saveList` para comparar o array anterior e novo, chamando `saveField` para itens mantidos, `add_entity` para novos itens e `remove_entity` para itens deletados.
3. **Usabilidade Editorial**:
   - Inclusão de botões de atalho `"Revisar e Publicar Alterações ➔"` tanto no topo quanto no rodapé da tela de detalhes de projetos, orientando claramente o fluxo Rascunho ➔ Publicação.

## 3. Arquivos Alterados
- [`src/app/features/admin/pages/editorial-project-detail/editorial-project-detail.component.ts`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/features/admin/pages/editorial-project-detail/editorial-project-detail.component.ts)
- [`src/app/features/admin/pages/editorial-project-detail/editorial-project-detail.component.html`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/features/admin/pages/editorial-project-detail/editorial-project-detail.component.html)
- [`src/app/features/admin/pages/editorial-project-detail/editorial-project-detail.component.css`](file:///c:/Users/xjoao/Desktop/portfolio/src/app/features/admin/pages/editorial-project-detail/editorial-project-detail.component.css)
- [`spec/03-features/alinhamento-textos-projetos-e-publicacao-editorial/spec.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/03-features/alinhamento-textos-projetos-e-publicacao-editorial/spec.md)
- [`spec/04-plano/alinhamento-textos-projetos-e-publicacao-editorial/tarefas.md`](file:///c:/Users/xjoao/Desktop/portfolio/spec/04-plano/alinhamento-textos-projetos-e-publicacao-editorial/tarefas.md)
- [`spec/05-verificacao/joao-vitor/publicar_snapshot_joao_vitor.sql`](file:///c:/Users/xjoao/Desktop/portfolio/spec/05-verificacao/joao-vitor/publicar_snapshot_joao_vitor.sql)
- [`supabase/atualizar_textos_projetos_v4.sql`](file:///c:/Users/xjoao/Desktop/portfolio/supabase/atualizar_textos_projetos_v4.sql)

## 4. Verificação
- **Testes Unitários:** 193/193 testes passando (`npm test -- --watch=false`).
- **Validação de Sintaxe SQL:** Bloco de dollar-quoting verificado e testado com parser JSON.

