# Spec da Feature — Layout em Coluna Única e Redesign dos Cards na Página de Detalhes de Projetos

Status: Aprovado por João Vitor  
Data de Criação: 19/10/2026  
Última Atualização: 19/10/2026  
Projeto: Portfólio Profissional (fork `joaovitordf/portfolio`)  
Onde vive no código:
- `src/app/features/portfolio/pages/project-detail/project-detail.component.html`
- `src/app/features/portfolio/pages/project-detail/project-detail.component.css`
- `src/app/features/portfolio/pages/project-detail/project-detail.component.ts`
- `src/app/features/portfolio/pages/project-detail/project-detail.component.spec.ts`

---

## 1. Contexto e Motivação

Atualmente, a página de detalhes de projetos (`/projetos/:id`) exibe as seções em um grid de 2 colunas (`.project-content-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }`), misturando blocos de texto curtos, listas de itens e chips de tecnologias lado a lado.

Essa visualização em 2 colunas gera os seguintes problemas:
1. **Quebra de fluxo de leitura:** Em telas largas, o olhar do leitor salta de forma desordenada entre colunas com alturas desiguais (ex: um card curto de Papel ao lado de um card longo de Decisões Técnicas).
2. **Hierarquia confusa de engenharia:** Tecnologias aparecem no meio da página (antes de Decisões Técnicas e Resultados), quando deveriam coroar o caso de estudo ao final.
3. **Estilo visual plano:** Os cards atuais utilizam uma cor bege sólida (`#ede6d9`) sem distinção de ícones, acentos ou diferenciação visual entre texto explicativo, decisões arquiteturais e métricas de resultado.

**Objetivo:** Evoluir para uma **coluna única vertical** elegante, moderna e fluida, com hierarquia clara, micro-ícones de cabeçalho, tipografia aprimorada, destaque visual para resultados e sequência lógica de case study aprovada por João Vitor.

---

## 2. Decisões de Design Aprovadas por João Vitor

### 2.1. Sequência Rígida dos Cards em Coluna Única
A sequência exata aprovada para o fluxo de leitura é:

1. **Hero do Projeto:** Título, Badges (Pessoal/Profissional + Público/Privado) e Descrição sintética.
2. **Card 1 — Contexto (`problemContext`):** Desafio, dor de negócio ou contexto do problema.
3. **Card 2 — Papel Desempenhado (`role`):** Responsabilidade e escopo de atuação do engenheiro.
4. **Card 3 — Solução (`solution` — se existir):** Arquitetura geral e visão da solução construída.
5. **Card 4 — Galeria de Imagens (`images` — se houver imagens):** Demonstração visual das telas da aplicação logo após a compreensão do desafio e da solução.
6. **Card 5 — Decisões Técnicas (`technicalDecisions`):** Lista estruturada de escolhas de engenharia, arquitetura e trade-offs.
7. **Card 6 — Aprendizados (`learnings`):** Lições consolidadas e evolução técnica adquirida.
8. **Card 7 — Resultados (`results`):** Métricas quantitativas de impacto e ganhos operacionais (com destaque e acento temático diferenciado).
9. **Card 8 — Tecnologias (`technologies`):** Stack tecnológica consolidada com ícones oficiais e nomes em chips refinados.
10. **Card 9 — Links Relacionados (`links` — se houver):** Botões de ação estilizados para repositório GitHub / demonstração em produção.

### 2.2. Largura e Alinhamento da Coluna
- Container centralizado com `max-width: 52rem` (aprox. 832px) para proporção áurea de leitura (65 a 80 caracteres por linha).
- Espaçamento vertical equilibrado entre cards (`gap: 1.5rem`).

### 2.3. Estilo Visual dos Cards (Superior à Imagem de Referência)
- **Cabeçalhos dos Cards com Micro-Ícones Vetoriais:** Cada card possui um ícone SVG temático elegante ao lado do título (bússola para Contexto, crachá/usuário para Papel, lâmpada para Solução, engrenagem/código para Decisões Técnicas, cérebro/livro para Aprendizados, gráfico ascendente para Resultados, camadas/chips para Tecnologias, link externo para Repositórios).
- **Destaque Visual para Resultados:** Borda de acento verde/ouro (`border-left: 3px solid #23654a`) e superfície sutilmente realçada, direcionando o foco do recrutador para as métricas.
- **Marcadores de Lista Customizados:** Marcadores limpos com bullets estilizados em tom terra/bronze em vez de bolinhas pretas padrão do browser.
- **Superfície Refinada:** Fundo com leve transparência e textura acolhedora (`rgba(255, 255, 255, 0.7)` / `#fbf8f2`), borda suave (`1px solid rgba(200, 186, 168, 0.45)`) e elevação suave ao passar o cursor (`transform: translateY(-2px)`).

---

## 3. Requisitos Funcionais

- **FR-001 (Layout Vertical em Coluna Única):**
  - Substituir o grid de 2 colunas por container vertical centralizado de coluna única (`max-width: 52rem`).
  - Totalmente responsivo em mobile com padding fluido.

- **FR-002 (Ordenação Rígida dos Blocos):**
  - Renderizar exatamente: Contexto ➔ Papel ➔ Solução ➔ Galeria ➔ Decisões Técnicas ➔ Aprendizados ➔ Resultados ➔ Tecnologias ➔ Links.
  - Ocultar condicionalmente qualquer seção sem conteúdo (ex: projetos sem imagem ou sem solução).

- **FR-003 (Micro-Ícones e Acentos Visuais):**
  - Renderizar micro-ícones SVG semânticos nos cabeçalhos de todos os cards.
  - Aplicar acento temático destacado no card de Resultados.

- **FR-004 (Preservação Editorial e Acessibilidade):**
  - Preservar integralmente todos os atributos `data-editorial-entity`, `data-editorial-field` e `data-editorial-locale`.
  - Manter acessibilidade com tags semânticas `<section>`, `<h2>`, `<p>`, `<ul>`, `<li>`.

---

## 4. Critérios de Aceite (Given / When / Then)

- **CA-01 (Estrutura e Ordenação):**
  - *Given* a navegação para `/projetos/:id`,
  - *When* o projeto carregar com sucesso,
  - *Then* os cards aparecem em coluna única centralizada na ordem: Contexto ➔ Papel ➔ Solução ➔ Galeria ➔ Decisões Técnicas ➔ Aprendizados ➔ Resultados ➔ Tecnologias ➔ Links.

- **CA-02 (Destaque nos Resultados e Tecnologias ao Fim):**
  - *Given* a leitura sequencial do estudo,
  - *When* o leitor chegar à parte final da página,
  - *Then* o card de *Resultados* possui acento visual de destaque, precedendo imediatamente o card de *Tecnologias*, que encerra a stack técnica utilizada.

- **CA-03 (Responsividade e Compatibilidade Editorial):**
  - *Given* a visualização em mobile e desktop,
  - *When* redimensionada a tela,
  - *Then* os cards se ajustam fluidamente sem overflow horizontal, e os atributos de edição editorial permanecem intactos.

