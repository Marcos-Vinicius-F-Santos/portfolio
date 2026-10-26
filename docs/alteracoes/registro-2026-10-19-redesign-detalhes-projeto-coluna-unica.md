# Registro de Alterações — Redesign em Coluna Única da Página de Detalhes de Projetos

Data: 19/10/2026  
Escopo:
1. Reestruturação do layout da página de detalhes de projetos (`/projetos/:id`) de grid de 2 colunas para coluna única vertical centralizada.
2. Reordenação da narrativa de engenharia de software para o fluxo de case study técnico: Contexto ➔ Papel ➔ Solução ➔ Galeria de Imagens ➔ Decisões Técnicas ➔ Aprendizados ➔ Resultados ➔ Tecnologias ➔ Links.
3. Refinamento estético dos cards com micro-ícones SVG vetoriais temáticos nos cabeçalhos, marcadores de lista customizados e destaque visual exclusivo para o card de Resultados.
4. Preservação integral de todos os atributos `data-editorial-*` para compatibilidade com o editor visual do painel administrativo.

---

## 1. Nova Estruturação e Ordem dos Cards

- **Fluxo Sequencial:**
  1. **Hero:** Título, badges (Pessoal/Profissional + Público/Privado) e descrição introdutória.
  2. **Contexto (`problemContext`):** Desafio e dor de negócio, com ícone de bússola.
  3. **Papel desempenhado (`role`):** Responsabilidade e escopo de atuação do engenheiro, com ícone de crachá/perfil.
  4. **Solução (`solution` — se existir):** Visão arquitetural e estrutural construída, com ícone de lâmpada.
  5. **Galeria de Imagens (`images` — se houver):** Visualização imediata das telas e artefatos logo após a compreensão do desafio e da solução.
  6. **Decisões Técnicas (`technicalDecisions`):** Escolhas de engenharia e trade-offs arquiteturais, com ícone de branch/grafo.
  7. **Aprendizados (`learnings`):** Lições consolidadas e evolução técnica, com ícone de livro.
  8. **Resultados (`results`):** Métricas e impacto mensurável, com ícone de tendência ascendente e realce visual exclusivo.
  9. **Tecnologias (`technologies`):** Stack e bibliotecas consolidadas ao final da narrativa técnica, com ícone de camadas e chips com logos SVG oficiais.
  10. **Links Relacionados (`links` — se houver):** Botões para código-fonte no GitHub ou demonstração em produção.

---

## 2. Refinamento Visual e Estilização (CSS)

- **Coluna Centralizada:**
  - Container `.project-detail-container` alinhado com `max-width: 52rem; margin: 0 auto; width: 100%;` criando proporção áurea de leitura (65 a 80 caracteres por linha).
  - `.project-content-grid` convertido para `display: flex; flex-direction: column; gap: 1.5rem;`.
- **Micro-Ícones nos Cabeçalhos:**
  - `.card-heading` com display inline-flex, alinhamento vertical e gap harmonioso com o título.
  - Ícones SVG vetoriais com efeito sutil de micro-interação no hover (`transform: scale(1.08)`).
- **Acento Temático no Card de Resultados:**
  - Classe `.detail-card--results` com borda lateral esquerda verde esmeralda (`border-left: 4px solid #23654a;`), gradiente de fundo suave (`rgba(35, 101, 74, 0.06)`) e ícone destacado.
- **Marcadores de Lista Customizados:**
  - `.card-list` sem marcadores padrão do navegador (`list-style: none; padding: 0;`).
  - `.card-list-item::before` com bullet points customizados em tom bronze/terra e verde esmeralda para os resultados.

---

## 3. Compatibilidade Editorial

- Mantidos rigorosamente todos os atributos `data-editorial-entity`, `data-editorial-field` e `data-editorial-locale` nos campos de texto, solução, contexto, papel e nas listas indexadas (`technicalDecisions`, `learnings`, `results`).

---

## 4. Validação e Testes

- **White-Label Gate:** `npm run check:white-label` aprovado (código 0).
- **Testes Unitários:** 36 suítes / 192 testes passando com sucesso (`npm test -- --watch=false`), incluindo novo teste que valida a sequência exata de renderização dos cards e a presença do destaque no card de Resultados.
- **Build de Produção:** `npm run build` gerado com sucesso sem avisos ou erros.

