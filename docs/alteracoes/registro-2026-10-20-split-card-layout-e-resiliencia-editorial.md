# Registro de Alterações — Layout Split-Card em Detalhes de Projetos e Resiliência Editorial

Data: 20/10/2026  
Escopo:
1. **Refinamento de Layout da Página de Detalhes (`/projetos/:id`):**
   - Transição do container estreito para layout Split-Card em telas desktop (`max-width: 70rem`), eliminando espaços vazios excessivos nas laterais.
   - Divisão estruturada em grid de 2 colunas por card no desktop: Coluna Esquerda (`15.5rem`) com micro-ícone e título perfeitamente centralizados verticalmente em relação ao conteúdo da Coluna Direita (`1fr` / largura áurea de leitura).
   - Preservação do comportamento responsivo empilhado em tablets e mobile (< 860px).
2. **Resiliência do Editor Visual e Fila de Autosave (`/admin/editor`):**
   - Suporte unificado aos códigos de conflito de revisão otimista (`P0001`, `P0409` e `40001`).
   - Sincronização automática da revisão do rascunho em caso de conflito detectado durante a ação de revisão (`review()`).
   - Garantia de reinicialização da revisão confirmada no autosave após operações atômicas como upload de imagem de projetos e inclusão de idiomas.
3. **Segurança e Conformidade:**
   - Nenhum segredo, token, credencial ou arquivo SQL commitado no repositório.
   - 100% dos testes unitários (193 testes) validados e aprovados.

---

## 1. Detalhes de Interface (CSS)

- **Container Expandido:** `.project-detail-container` ampliado de `52rem` para `70rem` (~1120px) em resoluções desktop.
- **Split-Card Layout:**
  - `@media (min-width: 860px)` com `display: grid; grid-template-columns: 15.5rem 1fr; column-gap: 2.5rem; align-items: center;`.
  - `.card-heading` com alinhamento vertical centralizado (`align-self: center; padding-top: 0;`), criando equilíbrio visual perfeito com a primeira linha do conteúdo à direita.
  - Tipografia de leitura ajustada (`card-text` e `card-list-item` com `line-height: 1.7`).

---

## 2. Robustez Editorial (TypeScript)

- **`VisualEditorComponent`:**
  - Tratamento de erro resiliente em `review()`: se a revisão local divergir do banco, o editor descarta a validação obsoleta, recarrega o rascunho atualizado e notifica o usuário sem travar a interface.
  - Sincronização do `EditorialAutosaveQueue.initialize(draft.revision)` após upload de imagens de projetos e criação de locales.
  - Reconhecimento dos códigos de exceção `P0001` e `P0409` junto a `40001`.
- **`EditorialAutosaveQueue`:**
  - `classifyFailure()` atualizado para categorizar mensagens contendo `revision conflict` com status `'conflict'`.

---

## 3. Verificação e Testes

- **Testes Unitários:** 36 suítes / 193 testes aprovados (`npm test -- --watch=false`).
- **Build de Produção:** compilação executada com sucesso sem regressões.

