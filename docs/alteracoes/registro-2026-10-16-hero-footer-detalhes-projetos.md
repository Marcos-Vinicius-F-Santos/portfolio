# Registro de Alterações — Hero, Rodapé Moderno e Página de Detalhes de Projetos

Data: 16/10/2026  
Escopo: Ajustes de layout no Hero, padronização de espaçamentos entre seções, criação do componente de rodapé moderno inspirado no Josias Broch, redesenho e adição de cabeçalho na página de detalhes de projetos (`/projetos/:id`), garantindo 100% de conformidade white-label.

---

## 1. Ajustes no Hero e Seções da Página Inicial (`portfolio-page`)

- **Remoção do botão de e-mail do Hero:**
  - O Hero exibe apenas os links sociais secundários (WhatsApp, LinkedIn, GitHub), filtrando o botão de e-mail (`heroContactLinks`).
  - O e-mail permanece disponível no canal de contato formal ao final da página.
- **Ajuste de disponibilidade profissional:**
  - Removido o rótulo "Remote" do badge de status do Hero, mantendo apenas o indicativo de abertura a oportunidades.
- **Abertura de links em nova aba:**
  - Os botões compactos de redes sociais do Hero agora abrem em nova aba com `target="_blank"` e `rel="noopener noreferrer"`.
- **Limpeza visual de linhas e espaçamentos:**
  - Removidas linhas divisórias desnecessárias entre Hero e About Me.
  - Padronizado o espaçamento vertical entre todas as seções principais da página (`gap: 6rem` no desktop, `4.5rem` em tablets e `3.5rem` no mobile), eliminando discrepâncias visuais de margem.

---

## 2. Componente Compartilhado de Rodapé (`SiteFooterComponent`)

- Criado o componente standalone `SiteFooterComponent` em `src/app/shared/components/site-footer/`.
- **Identidade e Monograma:**
  - Exibe o logotipo/monograma dinâmico à esquerda (`JV.dev` ou iniciais configuradas) com link para o topo (`/#apresentacao`).
- **Copyright e Créditos:**
  - Exibe o ano corrente dinâmico (`new Date().getFullYear()`).
  - Exibe os direitos autorais e créditos traduzidos (`Todos os direitos reservados.` / `All Rights Reserved.` e `Projetado e desenvolvido por [Nome].` / `Designed & engineered by [Nome].`).
- **Alinhamento e Estilo:**
  - Alinhamento centralizado das linhas de texto (`align-items: center` e `text-align: center`), garantindo perfeita harmonia entre as duas frases, sem recuos indesejados.
  - Fundo escuro com backdrop blur e borda superior sutil, idêntico à referência *Josias Broch*.
- **Integração:**
  - Adicionado à base da página inicial (`portfolio-page.component.html`).
  - Adicionado à base da página de detalhes de projetos (`project-detail.component.html`).

---

## 3. Topbar e Redesenho da Página de Detalhes de Projetos (`project-detail`)

- **Topbar / Cabeçalho Fixo (`.site-header`):**
  - Implementado o mesmo cabeçalho moderno da home com fundo escuro e blur backdrop.
  - Monograma dinâmico à esquerda com link para a home.
  - Botão central estilizado em pílula de retorno (`← Voltar aos projetos` / `← Back to projects`) apontando para `/#projetos`.
  - Dropdown discreto de idiomas (`PT` / `EN`) à direita, mantendo o `<select>` acessível preservado para leitores de tela e testes.
- **Estruturação Visual em Cartões:**
  - Layout alinhado aos tokens de design system (`--paper`, `--paper-strong`, `--ink`, `--line`, `--font-display`, `--font-sans`).
  - Hero do projeto com badge de categoria (*Projeto Pessoal* / *Projeto Profissional*), título em tipografia display e introdução.
  - Seções de Contexto, Solução, Papel, Tecnologias, Decisões Técnicas, Resultados e Aprendizados organizadas em cartões modernos (`.detail-card`).
  - Galeria de imagens com proporção 16:10, cantos arredondados, bordas sutis e efeito de hover zoom suave.
  - Links externos do projeto estilizados como botões em pílula, com ícone indicador `↗` e abertura segura em nova aba (`target="_blank"`, `rel="noopener noreferrer"`).

---

## 4. Preservação Rigorosa de White-Label

- Nenhuma menção a nomes pessoais, e-mails ou credenciais foi hardcoded nos arquivos da aplicação.
- A exibição do nome do autor no rodapé e metadados é computada dinamicamente com base em `PORTFOLIO_AUTHOR_NAME` do `.env` local ou Supabase (`__PORTFOLIO_SUPABASE_CONFIG__.authorName`), com fallback seguro para `"Desenvolvedor de Software"`.
- O gate de verificação `npm run check:white-label` foi executado e aprovado com 100% de sucesso.

---

## 5. Validação e Testes

- **Testes Unitários:** 183 testes passando (`npm test -- --watch=false`), incluindo novas asserções para o rodapé moderno, topbar de detalhes, links externos e alternância de idioma.
- **Compilação de Produção:** `npm run build` gerou os bundles sem nenhum aviso ou erro de compilação.
