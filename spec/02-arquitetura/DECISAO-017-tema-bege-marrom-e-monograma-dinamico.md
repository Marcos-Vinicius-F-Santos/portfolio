# Registro de Decisão — Tema Visual Bege & Marrom e Monograma Dinâmico com Stopwords

Data: 2026-10-13  
Status: Aprovado  
Feature: Identidade Visual e Header Flutuante  

---

## 1. Contexto

Após a implementação da barra de navegação moderna no topo, duas necessidades foram reportadas:
1. **Identidade Visual (Tema Bege & Marrom):**
   - Substituição da paleta de alto contraste preta/chumbo (`#11130f`) por tons quentes e elegantes de marrom café/espresso (`#261a14`), harmonizando com um fundo bege linho/areia refinado (`#f5f0e6`).
   - A barra superior (`.site-header`), anteriormente em tom preto translúcido, deve ser visivelmente marrom (`rgba(42, 28, 20, 0.92)` com blur de vidro), transmitindo uma atmosfera aconchegante e sofisticada.
   - Aplicação uniforme da paleta em todos os componentes (página principal, cabeçalho hero, painel de contato, detalhe de projeto e tela de login administrativo).
2. **Correção do Monograma da Marca no Topo:**
   - Anteriormente, o algoritmo de extração de iniciais gerava `DD.dev` quando o conteúdo carregado era o fallback neutro `"Desenvolvedor de Software"`, pois selecionava a primeira letra da primeira palavra ("D") e a primeira da segunda palavra ("d" de "de").
   - Além disso, preposições da língua portuguesa e inglesa ("de", "da", "do", "of", etc.) não eram filtradas, causando anomalias em nomes como "João de Souza" ou similares.
   - Para João Vitor, o monograma deve exibir fielmente `JV.dev`, enquanto para Marcos Santos ou qualquer outro autor deve derivar dinamicamente as iniciais corretas a partir do Supabase ou de configuração do ambiente (`PORTFOLIO_BRAND_INITIALS`).

---

## 2. Decisão

### A. Paleta de Cores Refinada (Bege & Marrom)
- **Fundo Base (`--paper`):** `#f5f0e6` (bege quente).
- **Fundo Secundário/Cards (`--paper-strong`):** `#e8dfd1` (bege pergaminho).
- **Linhas divisórias (`--line`):** `#c8baa8` (bege-areia suave).
- **Texto Principal & Hero Header (`--ink`):** `#261a14` (marrom escuro espresso, contraste acessível WCAG AAA de ~14:1 contra o fundo bege).
- **Topbar (`.site-header`):** `rgba(42, 28, 20, 0.92)` com `backdrop-filter: blur(14px)` e borda `rgba(200, 186, 168, 0.16)`.
- **Monograma (`.brand-logo__initials`):** Cápsula em tom marrom translúcido `rgba(85, 55, 38, 0.75)` com texto champagne dourado `#f7e7ce`.
- **Botões e Ações:** Botão de envio do painel de contato e ações administrativas harmonizados no tom marrom `#261a14` com hover `#3b281f`.

### B. Algoritmo de Extração de Iniciais (`extractBrandInitials`)
- Criação de função pura `extractBrandInitials(name, defaultInitials)`:
  1. Detecta cargos genéricos de fallback neutro (`"Desenvolvedor de Software"`, `"Software Engineer"`, etc.) e strings vazias/nulas, retornando as iniciais padrão do ambiente (default: `'JV'`).
  2. Filtra preposições e stopwords gramaticais (`de`, `da`, `do`, `das`, `dos`, `e`, `of`, `and`, etc.).
  3. Extrai as iniciais reais das palavras significativas (ex: `"João Vitor Dias Fernandes"` $\to$ `'JV'`; `"Marcos Vinícius Santos"` $\to$ `'MV'`; `"Marcos Santos"` $\to$ `'MS'`; `"Lucas de Souza"` $\to$ `'LS'`).
  4. Suporta injeção de `brandInitials` via `public/runtime-config.js` e variável de ambiente `PORTFOLIO_BRAND_INITIALS` / `AUTHOR_INITIALS`.

---

## 3. Consequências

- **Positivas:**
  - O portfólio de João exibe com precisão `JV.dev` tanto no fallback quanto dinamicamente do banco.
  - Sincronização 100% segura para o Marcos: caso Marcos suba a aplicação com seus dados no Supabase ou configure `PORTFOLIO_BRAND_INITIALS=MS`, suas iniciais serão exibidas dinamicamente sem colisão de dados pessoais.
  - Harmonia estética superior com paleta quente café e linho bege, sem perder acessibilidade nem contraste.
  - 163 testes passando e build 100% dentro do orçamento de performance (< 470 kB inicial).

