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
- **THEN** deve injetar `authorName: process.env.PORTFOLIO_AUTHOR_NAME ?? ''` no objeto `globalThis.__PORTFOLIO_SUPABASE_CONFIG__`.

### FR-005 — Remoção de subtítulo redundante na seção Portfólio e das linhas divisórias entre seções
- **GIVEN** a página inicial pública do portfólio
- **WHEN** as seções principais (`.sections > section`) e a seção `#portfolio` forem renderizadas
- **THEN** o parágrafo de subtítulo redundante `.portfolio-subtitle` (`portfolioSubtitle`) não deve ser renderizado na seção `#portfolio`.
- **AND** as linhas horizontais divisórias (`border-top: 1px solid var(--line)`) no topo dos elementos `<section>` não devem ser aplicadas.

### FR-006 — Padronização de Espaçamento entre as Seções e Topo
- **GIVEN** a página inicial pública do portfólio
- **WHEN** as seções verticais (`.sections > section`) forem renderizadas em qualquer viewport
- **THEN** o espaçamento entre a faixa de apresentação (Hero) e o título da primeira seção deve ser equilibrado e consistente (`padding-top: clamp(2rem, 4vw, 3.5rem)` no container `.sections`, zerando acúmulo de margens no topo).
- **AND** o espaçamento vertical entre todas as seções consecutivas (`#sobre-mim`, `#stack-tecnica`, `#portfolio`, `#contato`) deve ser estritamente padronizado e uniforme via `gap` no container `.sections` e zeramento de `margin-top` nos títulos `section h2` e de `min-height` artificial.

### FR-007 — Exclusão do botão de e-mail direto nos links compactos do Hero
- **GIVEN** a seção de apresentação (Hero) no topo da página pública
- **WHEN** os links de contato compactos (`compact-contact-links`) forem renderizados
- **THEN** o link de símbolo `email` não deve ser renderizado no Hero (mantendo apenas redes como LinkedIn, GitHub e telefone).
- **AND** a seção `#contato` no rodapé da página deve continuar exibindo todos os canais de contato normalmente, incluindo o pill de e-mail e o formulário de envio direto.

### FR-008 — Ajuste de disponibilidade no Hero sem sufixo de trabalho remoto
- **GIVEN** o badge de status de disponibilidade no Hero (`hero-status`)
- **WHEN** for renderizado em PT-BR ou EN
- **THEN** deve exibir apenas `"Disponível para novos projetos"` (PT-BR) ou `"Open to new opportunities"` (EN), omitindo o sufixo ` · Remoto` / ` · Remote`.

### FR-009 — Abertura de links externos de contato do Hero em nova aba
- **GIVEN** os links compactos de contato na seção Hero (`.compact-contact-link`)
- **WHEN** renderizados no DOM
- **THEN** devem possuir `target="_blank"` e `rel="noopener noreferrer"`, abrindo o perfil externo ou canal em uma nova aba do navegador sem descarregar a página do portfólio.

---

## 3. Critérios de Aceite (DoD)

1. [x] No topo da página pública, o nome do autor configurado e o subtítulo são exibidos corretamente.
2. [x] Não há seção `#formacao-academica` no DOM da página pública nem item de menu correspondente na navegação.
3. [x] A seção `#portfolio` é exibida com os cards de projetos, filtros de categoria e links funcionais.
4. [x] O botão "Ver projetos" no Hero está visível e rola suavemente até `#portfolio`.
5. [x] A seção `#portfolio` não exibe o parágrafo `.portfolio-subtitle` e as seções `.sections > section` não possuem linha divisória superior (`border-top`).
6. [x] 100% dos testes unitários passando (`npm test`).
7. [x] Build de produção (`npm run build`) concluído com sucesso.

