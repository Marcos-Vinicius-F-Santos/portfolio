# Spec da Feature — Revisão Geral, Saneamento de Dados e Refinamento Profissional do Portfólio

Status: Aprovado por João Vitor  
Criado em: 18/10/2026  
Última atualização: 18/10/2026  
Documento de registro e alterações: [`docs/alteracoes/registro-2026-10-18-alinhamento-curriculo-e-editorial.md`](file:///c:/Users/xjoao/Desktop/portfolio/docs/alteracoes/registro-2026-10-18-alinhamento-curriculo-e-editorial.md)

---

## 1. Contexto e Objetivo

Após a auditoria geral no código-fonte Angular e na base de dados do Supabase em comparação com o currículo oficial, esta especificação consolida as correções de dados, organização de habilidades, explicação de siglas e melhorias técnicas de UX/SPA e SEO aprovadas por João Vitor.

---

## 2. Decisões de Produto (Perguntas Resolvidas com João Vitor)

1. **Seções na Home:** Manter *Experiências* e *Formação Acadêmica* ocultas na Home (exibindo *Apresentação*, *Sobre mim*, *Habilidades*, *Portfólio de Projetos* e *Contato*).
2. **Período da SensorEng:** Manter `Set 2025 – Set 2026` (`2025-09-01` a `2026-09-01`) como está hoje.
3. **Botão de Link Externo nos Cards de Projetos:** Substituir o texto fixo `"Demo"` pelo rótulo real do link cadastrado (ex: `"GitHub ↗"`), mantendo o direcionamento para o GitHub.
4. **Habilidades e Categorias:** Remover `React` e `Node.js` (que não constam no currículo) e criar a categoria dedicada **"Visão Computacional"** (`OpenCV`, `YOLOv8`, `MediaPipe`, `OCR`), mantendo **"Versionamento e ferramentas"** exclusivamente com `Git`, `GitHub`, `GitLab` e `GitKraken`.
5. **Idiomas Falados:** Manter apenas no currículo em PDF, sem adicionar seção extra no site.

---

## 3. Requisitos Funcionais

- **FR-001 (Saneamento de Habilidades e Categorias):**
  - Remover `React` e `Node.js` do catálogo de habilidades exibido na seção *Habilidades* (no banco e nos fallbacks de `portfolio-content.ts`).
  - Criar a categoria `computer-vision` (*"Visão Computacional"* em PT / *"Computer Vision"* em EN) contendo `OpenCV`, `YOLOv8`, `MediaPipe` e `OCR`.
  - Manter a categoria `version-control` (*"Versionamento e ferramentas"* / *"Version control and tools"*) apenas com `Git`, `GitHub`, `GitLab` e `GitKraken`.
- **FR-002 (Clareza de Siglas no Conteúdo Editorial):**
  - Contextualizar na primeira menção (em `pt-BR` e `en`) as siglas técnicas e institucionais nos projetos e experiências: `SUAP`, `CNH`, `CRLV`, `EMBRAPII`, `HLS`, `RBAC`, `JCUKEN`, `ROIs`, `FSM`, `JSF`.
- **FR-003 (Alinhamento de Datas e Nomes no Banco):**
  - Atualizar a data de término de *Gestão de Crédito* (`5ab9dd44-8d76-4490-a254-d7bd01029e37`) para `2025-03-31` (Março/2025).
  - Uniformizar o nome **Avante Sistemas** (`147c2bd9-9ca4-4155-b6ab-8bf4dcf6c9a9`) em `pt-BR` e `en`.
- **FR-004 (Rótulo Fiel do Link Externo no Card e Badge Singular no Detalhe):**
  - No `ProjectCardComponent`, exibir `externalLink()?.label` (ex: `"GitHub"`) no badge flutuante sobre a capa em vez do texto estático `"Demo"`.
  - No `ProjectDetailComponent`, exibir o badge de tipo do projeto no singular (`"Projeto Pessoal"` / `"Personal Project"` ou `"Projeto Profissional"` / `"Professional Project"`).
- **FR-005 (Navegação SPA com `RouterLink`):**
  - Substituir links internos nativos `<a [href]="detailsUrl()">` por `[routerLink]="detailsUrl()"` no `ProjectCardComponent` e no botão de retorno em `ProjectDetailComponent`, evitando recarregamento integral do navegador.
- **FR-006 (SEO e `<title>` Dinâmico):**
  - Atualizar dinamicamente o `<title>` da aba do navegador e a meta tag `description` em `PortfolioPageComponent` e `ProjectDetailComponent` conforme os dados carregados e o idioma ativo, preservando `index.html` neutro para conformidade White-Label.

---

## 4. Critérios de Aceite (Given / When / Then)

- **CA-01 (Habilidades Alinhadas ao Currículo):**
  - *Given* que o visitante visualiza a seção de Habilidades,
  - *When* os cards de categorias são renderizados,
  - *Then* `React` e `Node.js` não aparecem, existe um card dedicado para *Visão Computacional* (`OpenCV`, `YOLOv8`, `MediaPipe`, `OCR`), e *Versionamento e ferramentas* exibe apenas `Git`, `GitHub`, `GitLab` e `GitKraken`.
- **CA-02 (Rótulo do Link Externo e Singularidade no Detalhe):**
  - *Given* um card de projeto com link de rótulo `"GitHub"`,
  - *When* o usuário passa o mouse sobre a capa ou abre a página de detalhes do projeto,
  - *Then* o botão sobre a capa exibe `"GitHub ↗"`, a transição ocorre via SPA sem reload da página, e o badge de tipo na página de detalhes aparece no singular.
- **CA-03 (Siglas Explicadas e Dados Sincronizados):**
  - *Given* os textos de projetos e experiências no banco de dados,
  - *When* lidos em `pt-BR` ou `en`,
  - *Then* todas as siglas possuem contextualização clara, *Avante Sistemas* está uniformizado e *Gestão de Crédito* finaliza em `2025-03-31`.

