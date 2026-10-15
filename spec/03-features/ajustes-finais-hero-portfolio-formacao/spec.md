# Spec da Feature — Ajustes Finais no Hero, Portfólio com Fallback e Remoção de Formação

Status: Proposta para Aprovação de João Vitor  
Projeto: Portfólio Profissional (fork de João Vitor: `joaovitordf/portfolio`)  
Onde vive no código:
- `src/app/features/portfolio/pages/portfolio-page/` (hero, seções verticais, navegação)
- `src/app/features/portfolio/services/` (conteúdo padrão, traduções, fallback de projetos e experiências)
- `scripts/generate-runtime-config.mjs` (injeção de `authorName` e `brandInitials`)

---

## 1. Contexto e Motivação

1. **Hero Name ("Desenvolvedor de Software" vs "João Vitor"):**
   - O título principal (`h1.hero-name`) na seção de apresentação inicial estava exibindo o texto genérico `"Desenvolvedor de Software"`, enquanto o subtítulo abaixo exibia `"Engenheiro de Software"`.
   - Isso ocorria porque `ORIGINAL_COPY.heroName` estava preenchido como `"Desenvolvedor de Software"` e coincidia com a lista de exclusão `GENERIC_TITLES`, caindo em um fallback genérico em vez do nome real de João Vitor.
   - O nome do desenvolvedor deve ser fixado como `"João Vitor"`, e a função profissional deve ser `"Engenheiro de Software"` (PT-BR) / `"Software Engineer"` (EN).

2. **Remoção da Seção "Formação Acadêmica":**
   - A seção `#formacao-academica` exibia uma linha estática com dados acadêmicos genéricos ("Graduação em Computação..."), destoando do refinamento das demais seções e parecendo incompleta/estranha.
   - O proprietário solicitou expressamente a remoção dessa seção da página principal e da barra de navegação.

3. **Garantia de Exibição da Seção "Portfólio" com Fallback Estático:**
   - A seção de projetos `#portfolio` e o botão de CTA do Hero ("Ver projetos") não estavam aparecendo na página pública quando o banco de dados Supabase não estava conectado ou não havia snapshot publicado.
   - Isso ocorria porque `PortfolioContentService.listProjects()` retornava um array vazio (`[]`) na ausência de conexão, fazendo com que a condição `showProjects = computed(() => this.projects().length > 0)` avaliasse como `false`.
   - A solução é definir um conjunto de projetos de fallback com os projetos reais de João Vitor (*Russian Mastery* e *Pipeline de Visão Computacional para Boxe*) para que a vitrine de cards em `#portfolio` e o botão "Ver projetos" sejam sempre exibidos imediatamente.

---

## 2. Requisitos Funcionais (Given / When / Then)

### FR-001 — Nome real de João Vitor no Hero H1
- **GIVEN** que o visitante acessa a página inicial do portfólio (em PT-BR ou EN)
- **WHEN** a seção de apresentação (Hero) for renderizada
- **THEN** o título principal `h1.hero-name` deve exibir `"João Vitor"`, e o subtítulo `p.hero-subtitle` deve exibir `"Engenheiro de Software"` (se em PT-BR) ou `"Software Engineer"` (se em EN).

### FR-002 — Remoção da seção e link de Formação Acadêmica
- **GIVEN** a página inicial do portfólio
- **WHEN** a página for carregada e a barra de navegação for inspecionada
- **THEN** a seção `#formacao-academica` não deve ser renderizada no corpo da página e nenhum link `#formacao-academica` deve constar na barra de navegação superior ou no menu mobile.
- **AND** a integridade dos modelos e serviços existentes de `PortfolioAcademicEntry` deve ser preservada para não quebrar integrações existentes ou ferramentas administrativas.

### FR-003 — Exibição resiliente da seção Portfólio (Fallback Estático)
- **GIVEN** que o banco de dados Supabase não está conectado ou não retornou projetos via snapshot
- **WHEN** o portfólio inicializar e carregar a lista de projetos
- **THEN** `PortfolioContentService.listProjects()` e `PublishedSnapshotContentService.listProjects()` devem retornar os projetos reais de fallback (`Russian Mastery` e `Pipeline de Visão Computacional para Boxe`).
- **AND** a seção `#portfolio`, seus cards de projetos e o botão "Ver projetos" do Hero devem estar visíveis e funcionais com filtros de categoria e links para repositórios.

### FR-004 — Injeção de Runtime Config
- **GIVEN** o script de geração de runtime `scripts/generate-runtime-config.mjs`
- **WHEN** executado durante o build ou inicialização
- **THEN** deve injetar `authorName: process.env.PORTFOLIO_AUTHOR_NAME ?? 'João Vitor'` no objeto `globalThis.__PORTFOLIO_SUPABASE_CONFIG__`.

---

## 3. Critérios de Aceite (DoD)

1. [ ] No topo da página pública, o nome visível é `"João Vitor"` e o subtítulo é `"Engenheiro de Software"`.
2. [ ] Não há seção `#formacao-academica` no DOM da página pública nem item de menu correspondente na navegação.
3. [ ] A seção `#portfolio` é exibida com os cards de *Russian Mastery* e *Pipeline de Visão Computacional para Boxe*, com seus badges de tecnologia e link para o GitHub.
4. [ ] O botão "Ver projetos" no Hero está visível e rola suavemente até `#portfolio`.
5. [ ] 100% dos testes unitários passando (`npm test`).
6. [ ] Build de produção (`npm run build`) concluído com sucesso.
