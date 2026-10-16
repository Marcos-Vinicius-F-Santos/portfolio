# Spec da Feature — Rodapé Moderno e Estilização da Página de Detalhes de Projetos

Status: Concluído — Pronto para Revisão de João Vitor  
Projeto: Portfólio Profissional (fork de João Vitor: `joaovitordf/portfolio`)  
Onde vive no código:
- `src/app/features/portfolio/pages/portfolio-page/` (rodapé na página inicial)
- `src/app/features/portfolio/pages/project-detail/` (topbar/header, estilização do conteúdo e rodapé na página de detalhes)
- `src/app/shared/components/site-footer/` ou template compartilhado (rodapé consistente)
- `src/app/features/portfolio/services/` (chaves de tradução de rodapé e navegação)

---

## 1. Contexto e Motivação

1. **Ausência de Rodapé (Footer):**
   - O portfólio de referência (*Josias Broch*) possui um rodapé moderno escuro com o monograma dinâmico à esquerda (`JB.dev`) e, à direita, os direitos autorais e créditos (`© 2026 [Nome]. All Rights Reserved. Designed & engineered by [Nome].`).
   - Atualmente, tanto a página inicial (`portfolio-page`) quanto a página de detalhes de projeto (`project-detail`) terminam abruptamente após a última seção, sem nenhum rodapé de encerramento visual.

2. **Página de Detalhes de Projetos Quebrada / Desatualizada (`/projetos/:id`):**
   - Ao clicar em "Ver projeto completo" na vitrine de projetos, o visitante é direcionado para a rota `/projetos/:id`.
   - Essa página foi implementada nas fases iniciais do projeto e não acompanhou a modernização visual do site:
     - Não possui o cabeçalho superior (`site-header`) com o monograma da marca, navegação de volta e alternância de idioma discreta. Em vez disso, exibia um link cru `← Back to projects` e um `<select>` de formulário desestilizado.
     - O conteúdo das seções (Contexto, Solução, Papel, Tecnologias, Decisões Técnicas, Imagens e Links) possui visual esquelético, sem a harmonia de cores, tipografia e cartões presentes no restante da aplicação.
     - Não possui rodapé ao final da leitura.

3. **White-Label e Blindagem:**
   - Todos os textos, nomes e monogramas devem ser 100% dinâmicos via `authorName()`, `brandMonogram()` e `currentYear`, sem nenhuma menção hardcoded a pessoas físicas.

---

## 2. Requisitos Funcionais (Given / When / Then)

### FR-001 — Rodapé Moderno e Responsivo (Site Footer)
- **GIVEN** o visitante navegando na página inicial ou na página de detalhes de projeto
- **WHEN** rolar até a base da página
- **THEN** deve ser exibido um rodapé moderno com fundo escuro (`rgba(18, 11, 7, 0.96)` ou `--surface` escuro) e borda sutil superior.
- **AND** à esquerda, deve exibir o logotipo/monograma dinâmico (`[Iniciais].dev`, ex: `JV.dev`) com link para o topo da página inicial (`/#apresentacao`).
- **AND** à direita, deve exibir o aviso de copyright com o ano corrente (`© 2026 [authorName]. Todos os direitos reservados.` / `All Rights Reserved.`) e a linha de crédito (`Projetado e desenvolvido por [authorName].` / `Designed & engineered by [authorName].`).
- **AND** em dispositivos móveis, o layout deve se adaptar verticalmente com alinhamento centralizado e espaçamento confortável.

### FR-002 — Topbar / Header Moderno na Página de Detalhes de Projeto
- **GIVEN** que o usuário acessa uma página de projeto (`/projetos/:id`)
- **WHEN** a página for renderizada
- **THEN** deve exibir o cabeçalho fixo (`site-header`) consistente com a identidade visual da aplicação.
- **AND** deve conter o logotipo/monograma dinâmico com link para a home.
- **AND** deve conter um botão pílula estilizado de retorno (`← Voltar aos projetos` / `← Back to projects`) que redireciona suavemente para `/#portfolio`.
- **AND** deve conter o seletor/dropdown de idioma discreto (`PT` / `EN`) permitindo alternar o idioma da descrição do projeto em tempo real.

### FR-003 — Estilização e Refinamento do Conteúdo da Página de Detalhes
- **GIVEN** a página de detalhes de projeto (`/projetos/:id`)
- **WHEN** o projeto for carregado com sucesso
- **THEN** o layout deve utilizar a paleta de cores (`var(--paper)`, `var(--ink)`, `var(--line)`, `var(--green)`) e as fontes do design system (`var(--font-display)`, `var(--font-sans)`, `var(--mono)`).
- **AND** o título principal do projeto deve usar tipografia display proeminente com badge de categoria (*Projeto Pessoal* / *Projeto Profissional*).
- **AND** as seções de *Contexto*, *Solução*, *Papel*, *Tecnologias*, *Decisões Técnicas*, *Resultados* e *Aprendizados* devem ser apresentadas em cartões modernos (`--paper-strong`, bordas sutis e tipografia legível).
- **AND** a galeria de imagens e os links externos devem possuir badges elegantes, com abertura de links externos e imagens em nova aba (`target="_blank"`, `rel="noopener noreferrer"`).

### FR-004 — Internacionalização e Dicionário de UI
- **GIVEN** a alternância de idiomas entre Português e Inglês
- **WHEN** o idioma for alterado
- **THEN** os textos do rodapé e da topbar de detalhes devem se atualizar automaticamente:
  - `allRightsReserved`: `"Todos os direitos reservados."` / `"All Rights Reserved."`
  - `designedAndEngineeredBy`: `"Projetado e desenvolvido por"` / `"Designed & engineered by"`
  - `backToProjects`: `"Voltar aos projetos"` / `"Back to projects"`

---

## 3. Critérios de Aceite (DoD)

1. [x] A página inicial (`portfolio-page`) exibe o novo rodapé moderno na base da página com monograma dinâmico e créditos white-label.
2. [x] A rota `/projetos/:id` exibe o novo cabeçalho (`site-header`) com monograma, botão estilizado de voltar aos projetos e dropdown de idioma.
3. [x] A rota `/projetos/:id` exibe o conteúdo estruturado em cartões modernos alinhados ao design system.
4. [x] A rota `/projetos/:id` exibe o novo rodapé na base da página.
5. [x] Todos os links externos de projetos abrem em nova aba (`target="_blank"`).
6. [x] 100% dos testes unitários passando (`npm test`).
7. [x] Gate de White-Label 100% aprovado (`npm run check:white-label`).

