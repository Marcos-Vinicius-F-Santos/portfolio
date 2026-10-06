# Relatório de Alterações do Portfólio

Este documento detalha todas as alterações implementadas no repositório, divididas entre **Alterações Pessoais** (conteúdo e identidade de João Vitor) e **Melhorias Técnicas & Correções de Bugs** (arquitetura, testes e correções de sistema que podem ser aproveitadas em qualquer fork).

---

## 1. Alterações Pessoais (Dados, Currículo e Perfil)

Estas alterações dizem respeito exclusivamente à personalização do portfólio para **João Vitor Dias Fernandes**:

### A. Currículos (PDF)
- **`public/curriculum-pt.pdf`**: Currículo atualizado em português (formato PDF).
- **`public/curriculum-en.pdf`**: Currículo atualizado em inglês (formato PDF).

### B. Conteúdo Estático de Apresentação e Contato
- **`src/index.html`**:
  - Título da página atualizado para "João Vitor Dias Fernandes | Portfólio".
  - Meta tags de descrição e autor ajustadas para João Vitor.
- **`src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html`**:
  - Heading principal e introdução exibindo o perfil de João Vitor Dias Fernandes.
- **`src/app/features/portfolio/content/portfolio-content.ts`**:
  - Dados estáticos de fallback atualizados:
    - **Apresentação & Sobre**: Formação em Ciência da Computação (IFMG), atuação em engenharia de software, front-end, visão computacional e IoT.
    - **Experiências**: SensorEng (Desenvolvedor Front-end), Avante Sistemas (Desenvolvedor Júnior Fullstack), Polo de Inovação IFMG (Estagiário de Engenharia de Software).
    - **Projetos**: Russian Mastery (plataforma full-stack de aprendizado de russo com repetição espaçada) e Pipeline de Visão Computacional para Boxe (TCC com YOLOv8).
    - **Habilidades & Tecnologias**: Categorias de linguagens (TypeScript, Python, Java, PHP, Dart), backend (FastAPI, Spring Boot, Laravel), frontend (Angular, Flutter), bancos de dados (PostgreSQL, MySQL, Supabase, Oracle) e versionamento/visão (Git, OpenCV, YOLOv8).
    - **Formação**: Bacharelado em Ciência da Computação (IFMG).
    - **Contatos**: Links diretos para LinkedIn (`/in/xjoao/`), GitHub (`joaovitordf`), e-mail profissional e telefone.
- **`src/app/features/portfolio/content/portfolio-translations.ts`**:
  - Textos traduzidos para inglês (`en`) e português (`pt-BR`) alinhados a todas as experiências e projetos de João Vitor.

### C. Especificações de Projeto (SDD - Spec-Driven Development)
- **`spec/03-features/adaptacao-portfolio-joao-vitor/`**: Especificação formal da adaptação de perfil.
- **`spec/03-features/ativacao-painel-admin-joao-vitor/`**: Especificação técnica para ativação do painel administrativo.
- **`spec/04-plano/adaptacao-portfolio-joao-vitor/` & `spec/04-plano/ativacao-painel-admin-joao-vitor/`**: Planos e tarefas de execução.
- **`spec/05-verificacao/ativacao-painel-admin-joao-vitor/`**: Snapshot editorial de inicialização com os dados de João Vitor.
- **`scripts/generate-joao-editorial-snapshot.mjs`**: Script auxiliar para serializar os dados de João Vitor no formato de snapshot do CMS editorial.

---

## 2. Melhorias Técnicas e Correções de Bugs (Código Reutilizável)

Estas melhorias são agnósticas de dados pessoais e corrigem problemas funcionais ou otimizam a arquitetura:

### A. Correção da Navegação no Login Admin (Problema do F5)
- **Arquivo**: `src/app/features/admin/authentication/admin-authentication.ts` e `src/app/core/auth/admin-auth.models.ts`
- **Problema**: Ao inserir as credenciais corretas na rota `/admin`, o painel às vezes não redirecionava para a tela logada (`/admin/content`) sem que o usuário recarregasse a página manualmente (F5).
- **Solução**:
  - Adicionado efeito reativo que observa o estado de autenticação (`AdminAuthService.sessionState`).
  - Se a sessão for resolvida com sucesso ou o usuário já estiver autenticado, o redirecionamento para a rota pós-login é disparado imediatamente via Angular Router.
  - Testes unitários atualizados em `admin-authentication.spec.ts`.

### B. Suporte a Novas Chaves do Supabase (`SUPABASE_PUBLISHABLE_KEY`)
- **Arquivo**: `scripts/generate-runtime-config.mjs`
- **Problema**: O Supabase atualizou o padrão de chaves para chaves publicáveis (`sb_publishable_...`). Projetos mais recentes usam `SUPABASE_PUBLISHABLE_KEY` no `.env`.
- **Solução**: O script agora detecta `SUPABASE_PUBLISHABLE_KEY` ou `SUPABASE_ANON_KEY`, garantindo compatibilidade reversa automática sem quebrar ambientes antigos.

### C. Conexão do Site Público às Publicações Editoriais (Adapter Pattern)
- **Arquivos**:
  - `src/app/features/portfolio/content/editorial-snapshot-adapter.ts`
  - `src/app/features/portfolio/content/editorial-snapshot-adapter.spec.ts`
  - `src/app/features/portfolio/content/portfolio-content.service.ts`
- **Solução**:
  - Implementado o `EditorialSnapshotAdapter` para converter o payload retornado pela RPC `get_versioned_public_portfolio` na estrutura que os componentes da página pública consomem (`PortfolioContent`).
  - Se o Supabase estiver configurado e com publicação ativa, o site público reflete automaticamente o conteúdo publicado no editor visual. Caso contrário, mantém fallback limpo para o conteúdo estático local.

### D. Limpeza e Otimização da Suíte de Testes
- **Arquivos removidos**:
  - `spec/05-verificacao/edicao-visual-rascunho-publicacao/initial-editorial-snapshot-v1.json` (removido arquivo obsoleto de 92 KB com dados legados).
  - `src/app/features/portfolio/content/initial-editorial-snapshot.spec.ts` (teste acoplado a dados do autor original).
  - `src/app/features/admin/media-management/editorial-media.models.spec.ts` (teste redundante de tipagem pura).
  - `src/app/features/admin/visual-editor/editorial-language.service.spec.ts` (teste trivial de 10 linhas coberto por outros testes).
  - `src/app/features/portfolio/content/portfolio-language-storage.spec.ts` e `portfolio-language.spec.ts` (subsumidos pelo teste do serviço `portfolio-language.service.spec.ts`).
- **Arquivos criados/ajustados**:
  - `src/app/features/portfolio/content/initial-editorial-snapshot-joao.spec.ts` (validação de integridade do snapshot de João).
  - `src/app/features/portfolio/content/editorial-snapshot-adapter.spec.ts` (7 testes garantindo a conversão correta de todos os blocos).
- **Impacto**:
  - De 31 para 26 arquivos de teste.
  - 135 testes executando em ~3.5 segundos, sem testes inúteis ou duplicados.
  - Zero falhas na suíte de testes.

---

## 3. Garantia de Segurança e Dados Sensíveis

- **Nenhum arquivo `.env` ou credencial privada foi versionado.** O `.gitignore` ignora `.env*` e `/public/runtime-config.js`.
- Nenhum script SQL solto foi deixado poluindo a raiz do repositório.

---

## 4. Refinamento Visual de Experiências, Correção de Largura de Texto e Ícones Oficiais (Outubro/2026)

Esta iteração atendeu aos refinamentos ergonômicos e visuais de apresentação pública e dados editoriais:

### A. Limites Visuais e Quadrantes Contínuos nos Cards de Experiência
- **Arquivo**: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html` e `portfolio-page.scss`
- **Problema**: Os blocos de experiência eram exibidos com divisórias tracejadas e quebradas no centro devido a gaps no grid, e sem linhas contínuas de ponta a ponta.
- **Solução**:
  - Reestruturação do grid em 4 quadrantes editoriais:
    - **Superior Esquerdo**: Contexto
    - **Inferior Esquerdo**: Responsabilidades
    - **Superior Direito**: Decisões Técnicas
    - **Inferior Direito**: Resultados
  - Linha divisória horizontal contínua e sólida (`1px solid var(--line)`) de uma extremidade à outra do card, sem quebras ou traços.
  - Linha divisória vertical contínua e sólida (`1px solid var(--line)`) da base do cabeçalho até o final do card, formando uma cruz perfeita (`+`) contínua com os quadrantes.
  - No mobile (<= 760px), colapso fluido para 1 coluna vertical com bordas inferiores sólidas contínuas em cada quadrante.

### B. Correção de Largura de Textos nos Containers (`max-width`)
- **Arquivo**: `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.scss`
- **Problema**: Textos de parágrafos como "Conteúdos estudados" (Formação Acadêmica) e "Contexto" (Experiências) quebravam prematuramente na metade da coluna devido a um seletor genérico `section p:last-child { max-width: 24rem; }`.
- **Solução**:
  - Remoção da restrição de 24rem e escopo do seletor restrito a parágrafos diretos de seções (`section > p`), permitindo que todos os textos internos de cards e colunas fluam livremente até o limite dos seus respectivos containers.

### C. Inclusão de Ícones SVG Vetoriais Oficiais para Tecnologias
- **Arquivos criados**:
  - `src/assets/skills/`: `python.svg`, `opencv.svg`, `yolo.svg`, `yolov8.svg`, `mediapipe.svg`, `flutter.svg`, `angular.svg`, `fastapi.svg`, `laravel.svg`, `dart.svg`, `php.svg`, `jsf.svg`, `supabase.svg`, `oracle.svg`, `redis.svg`, `gitlab.svg`, `gitkraken.svg`, `gradle.svg`, `maven.svg`.
- **Arquivos atualizados**:
  - `src/app/features/portfolio/content/portfolio-content.ts`: `FALLBACK_SKILL_ICON_URLS` populado com todas as tecnologias do catálogo.
  - `src/app/features/portfolio/content/technology-icons.ts`: `DIRECT_ICON_URLS` atualizado e aliases redundantes limpos.
  - `scripts/generate-joao-editorial-snapshot.mjs`: suporte a mime `image/svg+xml` e sincronização do snapshot editorial (`spec/05-verificacao/ativacao-painel-admin-joao-vitor/initial-editorial-snapshot-joao-v1.json`).
  - `src/app/features/portfolio/content/portfolio-content.spec.ts`: asserções de teste atualizadas para os novos ícones.

---

## 5. Padronização Arquitetural do Frontend e Migração de Estilos (Outubro/2026)

Esta iteração realizou uma modernização e padronização arquitetural completa na estrutura do código Angular, incorporando os padrões de excelência dos projetos de referência `sensoreng-frontend` e `russian-mastery`, mantendo **100% de integridade no layout, responsividade e regras de negócio**:

### A. Migração Global de SCSS para CSS Nativo
- **Motivação**: O projeto utilizava extensão `.scss` em seus componentes, porém 100% dos estilos eram escritos com CSS nativo e variáveis CSS (`:host { --ink: ...; --paper: ... }`). Não havia uso de mixins, funções ou variáveis de compilação do Sass. O uso de SCSS adicionava overhead desnecessário do compilador DartSass.
- **Ações**:
  - `angular.json`: configurado `schematics: { "@schematics/angular:component": { "style": "css" } }`, removido `"inlineStyleLanguage": "scss"` e apontada a folha global para `src/styles.css`.
  - Renomeação via `git mv` de todos os 8 arquivos `.scss` para `.css` (`src/styles.css`, `app.component.css`, `portfolio-page.component.css`, `project-detail.component.css`, `admin-authentication.component.css`, `content-management.component.css`, `media-management.component.css`, `visual-editor.component.css`).
  - Atualização dos metadados `@Component({ styleUrl: './*.css' })`.
  - **Benefício**: Build mais rápido (`ng build` e `ng serve`), código alinhado aos padrões web modernos (CSS nesting e CSS custom properties nativas).

### B. Nomenclatura Canônica do Angular Style Guide
- **Motivação**: Os componentes originais usavam nomenclatura encurtada (`portfolio-page.ts`, `app.ts`, `visual-editor.ts`), fugindo da convenção oficial do Angular (`*.component.ts`) e dificultando a busca rápida no editor (`Ctrl+P`).
- **Ações**:
  - Todos os arquivos de componentes foram renomeados para o padrão oficial: `<nome>.component.ts`, `<nome>.component.html` e `<nome>.component.css`.
  - Todas as classes exportadas receberam o sufixo canônico `Component` (`AppComponent`, `PortfolioPageComponent`, `ProjectDetailComponent`, `AdminAuthenticationComponent`, `AdminWorkspaceComponent`, `ContentManagementComponent`, `MediaManagementComponent`, `VisualEditorComponent`, `EditorialProjectDetailComponent`).
  - Arquivos `src/main.ts` e `src/app/app.routes.ts` atualizados para bootstrap e lazy loading com os novos identificadores.

### C. Criação da Camada Transversal `src/app/shared/`
- **Motivação**: Eliminar a regra de templates e estilos inline e desacoplar componentes reutilizáveis agnósticos de domínio (regra de ouro do `russian-mastery`).
- **Ações**:
  - Criado o diretório `src/app/shared/components/project-technologies/`.
  - O componente de lista de tecnologias (`<app-project-technologies>`) foi desacoplado em 3 arquivos dedicados:
    - `project-technologies.component.ts` (`ProjectTechnologiesComponent`)
    - `project-technologies.component.html`
    - `project-technologies.component.css`
  - Removido o arquivo antigo acoplado em `src/app/features/portfolio/presentation/projects/project-technologies.ts`.

### D. Reorganização das Features por Domínio (`pages/`, `services/`, `directives/`)
- **Motivação**: Padrão extraído do `sensoreng-frontend`, separando claramente as páginas/telas dos serviços de dados e diretivas especializadas.
- **Estrutura de `src/app/features/portfolio/`**:
  - `pages/portfolio-page/`: `portfolio-page.component.ts`, `.html`, `.css`, `.spec.ts`
  - `pages/project-detail/`: `project-detail.component.ts`, `.html`, `.css`, `.spec.ts`
  - `services/`: centralização de todos os serviços de conteúdo, adapters e modelos (`portfolio-content.service.ts`, `published-snapshot.service.ts`, `portfolio-language.service.ts`, `editorial-snapshot-adapter.ts`, etc.).
- **Estrutura de `src/app/features/admin/`**:
  - `pages/authentication/`: `admin-authentication.component.ts`, `.html`, `.css`, `.spec.ts`
  - `pages/admin-workspace/`: `admin-workspace.component.ts`, `.html`, `.css` (desacoplado de template inline)
  - `pages/content-management/`: `content-management.component.ts`, `.html`, `.css`, `.spec.ts`
  - `pages/media-management/`: `media-management.component.ts`, `.html`, `.css`, `.spec.ts`
  - `pages/visual-editor/`: `visual-editor.component.ts`, `.html`, `.css`
  - `pages/editorial-project-detail/`: `editorial-project-detail.component.ts`, `.html`, `.css` (desacoplado de template inline)
  - `directives/`: todas as diretivas de edição inline do visual editor (`editorial-text-editing.directive.ts`, etc.) com suas respectivas specs.
  - `services/`: todos os serviços editoriais e de mídias (`editorial-command.service.ts`, `editorial-autosave-queue.ts`, `media-management.service.ts`, etc.).

### E. Preservação Total da Arquitetura de Backend e Banco de Dados
- Mantido o **Supabase Serverless gerenciado** (PostgreSQL + RLS + Storage) com deploy Vercel a custo zero. Nenhuma migration, RPC ou schema de banco foi alterado.

### F. Evidências de Qualidade e Zero Regressão
- **Vitest**: Todos os 137 testes unitários em 27 arquivos de teste continuam passando com 100% de sucesso (`npm test -- --watch=false`).
- **Build de Produção**: `npm run build` gerando todos os bundles e lazy-chunks perfeitamente.
- **Layout & Funcionalidades**: 100% preservados sem nenhuma quebra visual ou comportamental.


