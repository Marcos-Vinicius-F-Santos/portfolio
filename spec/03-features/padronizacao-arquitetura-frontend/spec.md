# Spec da Feature — Padronização Arquitetural do Frontend e Migração para CSS Puro

Status: Implementado — pronto para revisão de Marcos  
Data: 2026-10-06  
Projeto: Portfólio Profissional — João Vitor Dias Fernandes  
Decisão Arquitetural: [ADR-013](../../02-arquitetura/DECISAO-013-padronizacao-arquitetural-frontend.md)  
Onde vive no código:  
- Configurações do Angular: `angular.json`
- Estilos Globais: `src/styles.css`
- Core: `src/app/core/`
- Shared: `src/app/shared/`
- Features: `src/app/features/portfolio/`, `src/app/features/admin/`

---

## 1. Objetivo

Reestruturar a arquitetura interna do código frontend do projeto para replicar as melhores práticas extraídas dos projetos de referência `sensoreng-frontend` e `russian-mastery`:
1. Padronizar todos os componentes sob a convenção oficial do Angular Style Guide (`<nome>.component.ts`, `<nome>.component.html`, `<nome>.component.css` e sufixo de classe `*Component`).
2. Eliminar o overhead do compilador SCSS, convertendo todos os arquivos de estilo para **CSS nativo puro** (`.css`) e preservando os tokens via CSS Custom Properties.
3. Organizar a arquitetura de pastas das features em subdiretórios claros de responsabilidade (`pages/`, `services/`, `directives/`), espelhando a clareza do `sensoreng-frontend`.
4. Criar a camada `src/app/shared/` para abrigar componentes reutilizáveis agnósticos de domínio, eliminando templates e estilos inline (espelhando a diretriz estrita do `russian-mastery`).
5. **Garantir estritamente zero alteração visual, de layout ou de funcionalidade**, mantendo 100% dos testes automatizados passando.

---

## 2. Contexto e Justificativa

- **SCSS Redundante:** O projeto utilizava extensão `.scss` mas continha exclusivamente código CSS padrão e variáveis `:host { --ink: ... }`. Isso forçava o Angular CLI a processar Sass desnecessariamente.
- **Divergência de Convenção Angular:** Componentes criados sem `.component` no nome de arquivo e na classe (ex: `portfolio-page.ts` com classe `PortfolioPage`) dificultavam a localização rápida e desviavam do ecossistema padrão adotado nos outros dois projetos.
- **Componentes Reutilizáveis Deslocados:** `<app-project-technologies>` possuía template e CSS inline dentro de `src/app/features/portfolio/presentation/projects/`, violando o princípio de desacoplamento em 3 arquivos praticado no `russian-mastery`.

---

## 3. Requisitos Funcionais (EARS)

### 3.1 Estilos e Configuração do Build
- **FR-001**: O SISTEMA DEVE configurar o Angular CLI (`angular.json`) para utilizar a extensão `.css` por padrão para componentes e folhas de estilo globais (`src/styles.css`).
- **FR-002**: O SISTEMA DEVE converter todos os arquivos `.scss` de componentes para `.css`, mantendo intactas todas as regras de layout, responsividade, seletores, fontes e CSS Custom Properties.
- **FR-003**: O build de produção gerado por `ng build` DEVE compilar com sucesso sem emitir erros ou warnings de pré-processador Sass.

### 3.2 Nomenclatura e Desacoplamento de Componentes
- **FR-004**: O SISTEMA DEVE renomear todos os arquivos de componentes para `<nome>.component.ts`, `<nome>.component.html` e `<nome>.component.css`.
- **FR-005**: O SISTEMA DEVE nomear todas as classes TypeScript de componentes com o sufixo canônico `Component` (ex: `AppComponent`, `PortfolioPageComponent`, `ProjectDetailComponent`, `VisualEditorComponent`, `MediaManagementComponent`, `AdminAuthenticationComponent`, `ContentManagementComponent`).
- **FR-006**: QUANDO um componente for declarado, O SISTEMA DEVE separar estritamente a lógica (`.component.ts`), o template (`.component.html`) e o estilo escopado (`.component.css`), proibindo o uso de templates inline ou estilos inline.

### 3.3 Organização de Pastas e Camada Shared
- **FR-007**: O SISTEMA DEVE disponibilizar uma camada transversal `src/app/shared/components/` contendo componentes visuais desacoplados e reutilizáveis (incluindo `ProjectTechnologiesComponent`).
- **FR-008**: O SISTEMA DEVE organizar as features de negócio em subdiretórios categorizados por responsabilidade:
  - `src/app/features/portfolio/pages/` e `src/app/features/portfolio/services/`.
  - `src/app/features/admin/pages/`, `src/app/features/admin/services/` e `src/app/features/admin/directives/`.

### 3.4 Integridade do Comportamento e Testes
- **FR-009**: O SISTEMA DEVE atualizar todos os arquivos de teste (`*.spec.ts`), rotas (`app.routes.ts`) e injeções de dependência para refletirem com precisão os novos caminhos e nomes de classe.
- **FR-010**: A suíte completa de testes automatizados unitários DEVE executar via Vitest com 100% de aprovação (todos os 137 testes passando).

---

## 4. Critérios de Aceite (Given / When / Then)

- **AC-001 (Migração para CSS Nativo e Build)**:
  - *Dado* que o projeto foi configurado com `style: css`,
  - *Quando* o comando `npm run build` é executado,
  - *Então* o bundle de produção é gerado com sucesso sem referências a `.scss` e todos os estilos e layouts na tela permanecem visualmente idênticos.

- **AC-002 (Nomenclatura Canônica Angular)**:
  - *Dado* que um desenvolvedor pesquisa por componentes no projeto,
  - *Quando* lista os arquivos em `src/app/`,
  - *Então* todos os componentes seguem a convenção `<nome>.component.ts`, `<nome>.component.html` e `<nome>.component.css` e utilizam o sufixo `Component` em suas classes exportadas.

- **AC-003 (Componente Reutilizável em Shared Desacoplado)**:
  - *Dado* o componente de exibição de tecnologias de projetos,
  - *Quando* ele é inspecionado em `src/app/shared/components/project-technologies/`,
  - *Então* ele é composto por `project-technologies.component.ts`, `project-technologies.component.html` e `project-technologies.component.css` (sem template/estilo inline) e renderiza normalmente na página pública e em detalhes de projetos.

- **AC-004 (Regressão Zero nos Testes)**:
  - *Dado* que a renomeação e a movimentação de pastas foram concluídas,
  - *Quando* o comando `npm test -- --watch=false` é executado,
  - *Então* 100% dos 137 testes unitários passam com sucesso.

- **AC-005 (Preservação de Funcionalidades e Layout)**:
  - *Dado* que a aplicação está em execução (`npm start`),
  - *Quando* o usuário navega pela Home pública, detalhes de projetos, ou autentica no painel administrativo e editor visual,
  - *Então* todas as ações de alternância de idioma, navegação, edição de rascunho, gerenciamento de mídias e publicação continuam operando sem qualquer regressão.
