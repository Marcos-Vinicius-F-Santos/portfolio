# Spec da Feature — Conteúdo textual no banco + Seção "Portfólio" em cards

Status: **Aprovada por João Vitor (2026-10-14)**  
Projeto: Portfólio Profissional (fork de João Vitor: `joaovitordf/portfolio` sobre upstream `Marcos-Vinicius-F-Santos/portfolio`)  
Data da aprovação: 2026-10-14  
Onde vive no código:
- `src/app/features/portfolio/` (página pública, serviços de conteúdo, modelos)
- `src/app/features/admin/` (editor visual `/admin/editor`, detalhe de projeto, mídias)
- `src/app/shared/components/project-card/` (novo componente de card de projeto)
- `supabase/migrations/` e `supabase/setup_editorial_joao_vitor.sql` (migrations e seed)

> **Para o agente que for implementar:** Esta spec foi formalmente aprovada pelo João Vitor (dono deste fork). Siga a ordem incremental das tarefas na Seção 6 sem pular etapas. Toda alteração de schema deve ser acompanhada de migration idempotente e rollback documentado em `spec/05-verificacao/`.

---

## 1. Decisões Confirmadas pelo Aprovador (João Vitor)

| ID | Tópico | Decisão Aprovada |
|---|---|---|
| **Q1** | Aprovador do Fork | **João Vitor** é o aprovador final de specs e deploys deste repositório fork. `AGENTS.md` já foi atualizado para refletir isso e corrigir caminhos para `spec/`. |
| **Q2** | Fluxo com Marcos (Upstream) | As alterações são feitas e validadas **apenas no fork de João Vitor**. Posteriormente, Marcos analisará e incorporará no upstream o que for conveniente para ele. |
| **Q3** | Modelo de 3 Camadas de Conteúdo | **Aprovado:** Camada T1 (conteúdo pessoal) no banco; Camada T2 (rótulos de interface e botões) em dicionário neutro de código; Camada T3 (estrutura) no HTML/CSS. |
| **Q4** | Formato da Seção | **Cards modernos** (estilo Josias Broch), com chips de filtro opcionais no topo: "Todos", "Profissionais" e "Pessoais". |
| **Q5** | Portfólio × Projetos | **Unificados:** A seção "Portfólio" (`#portfolio`) substitui a antiga seção de projetos e vira a vitrine principal em cards. O clique no card leva para a página `/projetos/:id`. |
| **Q6** | Seção "Resultados" | **Oculta da página principal e da navegação.** Os dados textuais de resultados continuam no banco e poderão ser incorporados na tela de detalhes do projeto futuramente. |
| **Q7** | Interação dos Cards | O card direciona para `/projetos/:id` (ou `/admin/editor/projetos/:id` no modo editor). O ícone de link externo ↗ e botão "Demo" abrem o link externo (demonstração/repositório). |
| **Q8** | Descrição Curta | Utilizar `project.description` com corte por CSS (`line-clamp: 3`) nos cards, garantindo altura padronizada sem necessidade de campos adicionais no schema. |
| **Q9** | Link Externo | Utilizar o primeiro link registrado no projeto (`project.links[0]`) para o botão Demo / seta ↗. |
| **Q10** | Capa e Placeholder | Quando o projeto tiver imagens no banco, usar a primeira como capa (16:10). Quando não tiver, exibir **placeholder padrão sofisticado gerado em CSS/SVG** com moldura de navegador e ícone de código. |
| **Q11** | Contrato de Mídia | Expandir o suporte de imagens de projeto no Supabase Storage para aceitar **WebP, PNG e JPEG** e limite de tamanho ampliado para **até 3 MB**. |
| **Q12** | Visibilidade Mínima | Relaxar a regra rígida de 8 campos: na vitrine de cards da home, qualquer projeto publicado com pelo menos `name` e `description` preenchidos é renderizado. |
| **Q13** | Hero no Banco | `heroName`, `heroRole` e `heroAvailability` serão entidades `interfaceText` gerenciadas no banco, eliminando regex do texto de `intro` e nomes fixos no TS. |
| **Q14** | Foto de Perfil | Copiar e utilizar a foto real `C:\Users\xjoao\Desktop\linkedin.jpg` como foto de perfil inicial de João Vitor em `src/assets/profile/joao-vitor.jpg`. Futuramente tornar substituível via upload na área administrativa. |
| **Q15** | Criação das Chaves no Banco | Migration idempotente insere as novas entidades `interfaceText` no rascunho com traduções iniciais (seed). Ao abrir `/admin/editor`, o usuário pode editar e publicar. |
| **Q16** | Limpeza de Fallbacks (White-Label) | O conteúdo pessoal atualmente no diff vira o seed do banco de João Vitor (`setup_editorial_joao_vitor.sql`), e os fallbacks em `portfolio-content.ts` tornam-se 100% neutros/genéricos (evitando contaminação caso Marcos faça merge). |
| **Q17** | Features em Andamento | Consolidar e commitar as alterações locais existentes das features de Sobre Mim, Habilidades estilo Josias e Contato (T-001) antes de aplicar as mudanças estruturais desta feature. |
| **Q18** | Conteúdo Bilíngue (PT/EN) | Textos iniciais traduzidos para inglês por IA. No `/admin/editor`, a alternância de idioma permite editar PT-BR e EN de forma 100% independente. |
| **Q19** | Animações | Transições suaves em CSS (hover elevando o card `translateY(-4px)`, realce de borda dourada/âmbar, leve escala na capa), com respeito a `prefers-reduced-motion`. |
| **Q20** | Paleta e Identidade Visual | Preservar a paleta quente aprovada (bege linho `#f5f0e6`, marrom espresso `#261a14`, pergaminho `#e8dfd1` e realces dourados/âmbar — ADR-017). |

---

## 2. Diagnóstico Arquitetural e Estado Atual

### 2.1 O que já está pronto e deve ser aproveitado
1. **Infraestrutura Editorial Supabase:** O schema `portfolio_editorial` suporta publicação imutável (snapshot v1), rascunho privado, histórico e descarte via RPCs.
2. **Entidades `interfaceText`:** Permitem armazenar qualquer texto público com id `copy-<chave>` e campos traduzíveis `text` por locale (`pt-BR`, `en`).
3. **Editor Visual WYSIWYG (`/admin/editor`):** Utiliza atributos `data-editorial-entity="copy-<chave>"` e `data-editorial-field="text"` para permitir edição direta em tela com salvamento em rascunho.
4. **Gerenciador de Mídias e Detalhe de Projeto (`/admin/editor/projetos/:id`):** Já possui fluxo de upload e ordenação de fotos de projetos.

### 2.2 O que precisa ser corrigido / completado
1. **Chaves novas apenas no TS:** As chaves adicionadas recentemente (`aboutHeadline`, `aboutFocus`, `aboutPillar1..3*`, `contactHeadline`, `contactSubtitle`, etc.) precisam existir no banco como entidades `interfaceText` no rascunho, caso contrário o editor visual falha com `entity not found`.
2. **Isolamento de Dados (White-Label - ADR-015):** Os fallbacks estáticos em `portfolio-content.ts` e `authorName` voltaram a conter dados pessoais de João Vitor. Devem ser neutralizados no código e persistidos exclusivamente no banco/snapshot.
3. **Seção de Resultados:** A seção com 4 métricas soltas deve ser removida da home pública e do menu de navegação, abrindo espaço para a seção unificada "Portfólio".
4. **Filtro de 8 campos em Projetos:** A função `hasPortfolioProjectContent` filtra projetos incompletos na home. Deve ser relaxada para o card de vitrine exibir projetos que tenham nome e descrição.
5. **Foto de Perfil:** O avatar hoje é uma silhueta cinza SVG. Deve exibir a foto real do João (`C:\Users\xjoao\Desktop\linkedin.jpg`) como padrão e fallback.

---

## 3. Especificação das Camadas de Conteúdo (Modelo White-Label)

### 3.1 Camada T1: Conteúdo Pessoal (Exclusivo no Banco / Snapshot)
Gerenciado via Supabase e editável no `/admin/editor`:
- `heroName`: Nome do desenvolvedor (ex: "João Vitor Dias Fernandes").
- `heroRole`: Cargo em destaque (ex: "Engenheiro de Software").
- `heroAvailability`: Status de disponibilidade (ex: "Disponível para novos projetos · Remoto").
- `intro`: Apresentação curta do hero.
- `aboutTitle`, `aboutHeadline`, `aboutBody`, `aboutFocus`.
- `aboutPillar1Title`, `aboutPillar1Description`, `aboutPillar2Title`, `aboutPillar2Description`, `aboutPillar3Title`, `aboutPillar3Description`.
- `portfolioEyebrow`, `portfolioTitle`, `portfolioSubtitle`.
- `contactTitle`, `contactHeadline`, `contactSubtitle`, `contactExplanation`.
- Entidades completas de `project`, `experience`, `skill`, `academic`, `contact` (redes e telefone).

### 3.2 Camada T2: Rótulos de Interface e Ações (Dicionário Neutro no Código)
Textos fixos de navegação e componentes, tipados em TypeScript por idioma:
- Botões: "Ver projetos" / "View Projects", "Fale comigo" / "Contact Me", "Demo", "Ver projeto completo" / "View full project", "Baixar currículo" / "Download resume".
- Rótulos: "Currículo" / "Resume", "Idioma" / "Language", "Filtro: Todos / Profissionais / Pessoais", "Em andamento" / "In progress", "Concluído" / "Completed".
- Mensagens de validação do formulário de contato e diálogos de acessibilidade.

### 3.3 Camada T3: Estrutura e Apresentação (HTML / CSS)
- Layout em grade responsiva, ícones SVG dos pilares de engenharia, paleta de cores bege/marrom, efeitos de hover e molduras de cards.

---

## 4. Especificação Visual da Seção "Portfólio" (Estilo Josias Broch)

### 4.1 Estrutura da Seção (`#portfolio`)
```html
<section id="portfolio" class="portfolio-section" data-editorial-section-id="projects-section">
  <div class="portfolio-section__header">
    <span class="section-eyebrow">{{ copy().portfolioEyebrow || 'PORTFÓLIO' }}</span>
    <h2 class="section-title">{{ copy().portfolioTitle || 'Projetos em Destaque' }}</h2>
    <p class="section-subtitle">{{ copy().portfolioSubtitle }}</p>
    
    <!-- Chips de Filtro -->
    <div class="portfolio-filter-tabs" role="tablist">
      <button class="filter-tab filter-tab--active" data-filter="all">Todos</button>
      <button class="filter-tab" data-filter="professional">Profissionais</button>
      <button class="filter-tab" data-filter="personal">Pessoais</button>
    </div>
  </div>

  <div class="portfolio-grid">
    <!-- Componentes app-project-card iterados dinamicamente -->
  </div>
</section>
```

### 4.2 Anatomia do Card (`app-project-card`)
- **Container do Card:** `border-radius: 1.25rem`, fundo pergaminho (`var(--paper-strong)`), borda sutil (`var(--line)`), sombra suave. Efeito hover: elevação de 4px, realce de borda âmbar (`#c48b52`) e sombra ampliada.
- **Moldura do Topo (Browser Window):** Barra horizontal discreta com 3 pontinhos simulando janela de navegador.
- **Área da Capa (16:10):**
  - Se houver imagem: `<img [src]="coverUrl" [alt]="project.name" loading="lazy" class="project-cover" />` com leve zoom no hover.
  - Se não houver imagem: **Placeholder visual em CSS/SVG** com gradiente bege profundo, ícone elegante de código e o monograma do projeto.
  - Overlay de ação rápida: botão circular/pílula "Demo" no hover (abre link externo).
- **Conteúdo Textual:**
  - Título do Projeto: tipografia Space Grotesk, com ícone de seta diagonal ↗ para link externo.
  - Descrição: tipografia Inter, máximo de 3 linhas com reticências (`display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;`).
  - Chips de Tecnologia: tags circulares compactas no rodapé do card (`TypeScript`, `Angular`, `Python`, etc.).
  - Link de Acesso Completo: "Ver projeto completo →" navegando para a rota de detalhe.

---

## 5. Requisitos Funcionais e Critérios de Aceite

### 5.1 Requisitos Funcionais (FR)
- **FR-001 (Hero Pessoal):** O hero da página deve renderizar o nome, cargo, disponibilidade e foto de perfil de João Vitor carregados dinamicamente das novas chaves/ativos.
- **FR-002 (Seção Portfólio em Cards):** A home deve renderizar a seção de projetos com o título "Portfólio" no lugar de "Resultados", organizando os projetos em grade de cards moderna (1 coluna mobile, 2 tablet, 3 desktop).
- **FR-003 (Filtro por Categoria):** O usuário deve poder filtrar os cards exibidos entre "Todos", "Profissionais" e "Pessoais" de forma instantânea sem recarregar a página.
- **FR-004 (Placeholder Padrão):** Projetos sem imagens associadas devem renderizar uma capa placeholder limpa em SVG/CSS, sem quebras visuais ou links rompidos.
- **FR-005 (Foto de Perfil):** O hero card deve utilizar a foto `src/assets/profile/joao-vitor.jpg` (importada de `C:\Users\xjoao\Desktop\linkedin.jpg`), com borda estilizada e badge de disponibilidade.
- **FR-006 (Edição no Admin):** Todas as novas chaves (`heroName`, `heroRole`, `heroAvailability`, `aboutHeadline`, `aboutFocus`, `aboutPillar*`, `portfolioTitle`, etc.) devem ser editáveis no `/admin/editor` para `pt-BR` e `en`.
- **FR-007 (Navegação Limpa):** A barra superior deve ter como itens: Início, Sobre mim, Habilidades, Experiências, Portfólio, Formação e Contato. "Resultados" não deve aparecer na barra de navegação.

### 5.2 Critérios de Aceite (AC)
- **AC-001:** Dado que o visitante acessa a home, então a seção "Portfólio" exibe os cards com capa 16:10, título, descrição curta e badges de tecnologias.
- **AC-002:** Dado que um card é clicado, o visitante é direcionado para a página detalhada `/projetos/:id`.
- **AC-003:** Dado que o botão "Demo" ou ícone ↗ do card é clicado, o link externo do projeto abre em uma nova aba com `rel="noopener noreferrer"`.
- **AC-004:** Dado que o filtro "Pessoais" é selecionado, apenas projetos com `type === 'personal'` permanecem visíveis na grade.
- **AC-005:** Dado que o administrador acessa `/admin/editor`, todos os textos da página (inclusive headline, foco e pilares) possuem contorno de edição e podem ser salvos e publicados.
- **AC-006:** Dado que a suíte de testes unitários é executada (`npm test`), todos os testes passam com 100% de sucesso.
- **AC-007:** Dado que o build de produção é gerado (`npm run build`), o tamanho do chunk inicial permanece abaixo do teto de 500 kB.

---

## 6. Plano de Execução Incremental

### Fase 0 — Linha de Base e Consolidação
- **T-001:** Consolidar e commitar as alterações locais existentes das features em curso (`aprimoramento-secao-sobre-mim`, `estilizacao-habilidades-estilo-josias`, `layout-contato-duas-colunas`), executando testes e build para registrar a linha de base limpa.
- **T-002:** Importar a foto `C:\Users\xjoao\Desktop\linkedin.jpg` para `src/assets/profile/joao-vitor.jpg` e referenciá-la no componente do hero.

### Fase 1 — Parte A: Conteúdo no Banco e Isolamento White-Label
- **T-003:** Criar o dicionário de interface T2 tipado (PT/EN) para remover ternários hardcoded nos templates.
- **T-004:** Neutralizar fallbacks estáticos em `portfolio-content.ts` e `portfolio-translations.ts`, eliminando dados específicos e heurísticas legadas de cursos.
- **T-005:** Adicionar as chaves T1 de hero e portfólio na tipagem `PortfolioCopy` com marcações `data-editorial-*` no template.
- **T-006:** Criar migration idempotente no Supabase adicionando as novas entidades `interfaceText` com defaults no rascunho (`supabase/migrations/`).
- **T-007:** Atualizar o script de seed de João Vitor (`scripts/generate-joao-editorial-snapshot.mjs` e `supabase/setup_editorial_joao_vitor.sql`) com o conteúdo pessoal real e suas respectivas traduções em inglês.

### Fase 2 — Parte B: Seção Portfólio em Cards
- **T-008:** Criar o componente isolado `ProjectCardComponent` em `src/app/shared/components/project-card/` com suporte a capa, placeholder CSS/SVG, badges de tecnologia, clamp de texto e atributos editoriais.
- **T-009:** Atualizar `PortfolioPageComponent` para renderizar a seção `#portfolio` com os novos cards e os botões de filtro ("Todos", "Profissionais", "Pessoais").
- **T-010:** Atualizar o serviço de conteúdo para relaxar a regra de 8 campos obrigatórios na vitrine da home (FR-B5).
- **T-011:** Remover a seção "Resultados profissionais" da home e da barra de navegação/scrollspy, mantendo os dados preservados.
- **T-012:** Ajustar o contrato de mídia no Supabase para suportar WebP e limite de 3 MB para uploads de imagens de projetos.

### Fase 3 — Validação, Testes e Documentação
- **T-013:** Atualizar testes unitários e criar testes para o novo `ProjectCardComponent` e filtros de categoria.
- **T-014:** Verificar visualmente e responsivamente nos viewports desktop (1440px), tablet (768px) e mobile (390px).
- **T-015:** Validar a edição completa no editor visual (`/admin/editor`) e publicação de rascunho.
- **T-016:** Documentar as decisões arquiteturais em `spec/02-arquitetura/` e atualizar `docs/alteracoes/`.
- **T-017:** Revisão final de convergência e checklist de deploy aprovado por João Vitor.

---

## 7. Critério de Conclusão da Feature (DoD)
- [x] Spec revisada e aprovada pelo João Vitor.
- [ ] Fase 0, Fase 1, Fase 2 e Fase 3 executadas estritamente na ordem.
- [ ] 100% dos testes unitários passando (`npm test`).
- [ ] Build de produção sem warnings de budget (`npm run build`).
- [ ] Revisão final e aprovação de João Vitor antes do deploy.
