# Registro de Decisão — Padronização Arquitetural do Frontend e Migração de Estilos

Data: 2026-10-06  
Status: Aprovado por Marcos em 2026-10-06  
Spec: [Padronização da Arquitetura do Frontend](../03-features/padronizacao-arquitetura-frontend/spec.md)

## Contexto

O projeto do portfólio vinha acumulando inconsistências em relação às melhores práticas do ecossistema Angular e aos padrões consolidados nos projetos de referência do autor (`sensoreng-frontend` e `russian-mastery`):
1. **Falso SCSS:** Arquivos de componentes e globais usavam extensão `.scss`, mas continham 100% de CSS nativo com variáveis CSS (`--variavel`), adicionando overhead desnecessário do compilador Sass.
2. **Nomenclatura não convencional:** Arquivos de componentes foram nomeados sem o sufixo oficial `.component.ts`, `.component.html`, `.component.scss` (ex: `portfolio-page.ts`, `visual-editor.ts`), divergindo da convenção oficial do Angular Style Guide adotada em `sensoreng-frontend` e `russian-mastery`.
3. **Ausência de camada `shared/`:** Componentes reutilizáveis (como `<app-project-technologies>`) estavam misturados em pastas de apresentação com templates inline.
4. **Falta de subdivisão limpa nas features:** As pastas de feature misturavam telas, serviços de dados e diretivas sem a organização clara em `pages/` e `services/` presente no `sensoreng-frontend`.

Foi avaliada a introdução de Spring Boot (Java) no backend. No entanto, em consonância com o Princípio 1 de Engenharia ("A arquitetura mais simples que atende o que já está confirmado hoje é melhor"), Marcos deliberou pela **manutenção da arquitetura Jamstack com Supabase** (PostgreSQL + RLS + Storage) e hospedagem Vercel a custo zero, focando a evolução exclusivamente na excelência arquitetural do Frontend Angular.

## Decisão

1. **Backend e Persistência:** Manter o Supabase como backend gerenciado e banco de dados relacional. Nenhuma alteração de schema, migration ou RPC do Supabase será realizada nesta evolução.
2. **Migração Global para CSS Nativo:** 
   - Configurar o Angular CLI (`angular.json`) para usar `style: css`.
   - Renomear todos os arquivos `.scss` para `.css` (`src/styles.css` e estilos de componentes).
   - Manter design tokens via CSS Custom Properties.
3. **Nomenclatura Canônica do Angular:**
   - Renomear todos os arquivos de componentes para `<nome>.component.ts`, `<nome>.component.html` e `<nome>.component.css`.
   - Padronizar as classes com o sufixo canônico (ex: `PortfolioPageComponent`, `AppComponent`, `VisualEditorComponent`).
4. **Estrutura de Pastas Inspirada em `sensoreng-frontend` e `russian-mastery`:**
   - `src/app/core/`: Guards, configurações e clientes singleton (Supabase).
   - `src/app/shared/`: Componentes agnósticos de domínio totalmente desacoplados em 3 arquivos (`.component.ts`, `.component.html`, `.component.css`), sem templates inline.
   - `src/app/features/<feature>/`:
     - `pages/`: Componentes de páginas e rotas.
     - `services/`: Serviços e regras de negócio da feature.
     - `directives/`: Diretivas especializadas (no caso do `visual-editor`).
5. **Zero alteração visual ou funcional:** Layout, responsividade, textos e comportamentos públicos e administrativos permanecem idênticos.

## Consequências

- O build do Angular torna-se mais rápido e leve, sem dependência do compilador DartSass.
- A navegação e localização de arquivos no editor (`Ctrl+P`) fica uniforme e intuitiva.
- Elimina-se o acoplamento de templates inline em componentes compartilhados.
- Preserva-se 100% da compatibilidade com a suíte de testes existente (137 testes no Vitest).

## Verificação

- O comando `npm run build` deve compilar com sucesso sem warnings de pré-processador Sass e respeitar os budgets de tamanho.
- A suíte completa de testes (`npm test -- --watch=false`) deve passar com 100% de sucesso.
- O portfólio público e o painel administrativo mantêm o mesmo visual e funcionamento.
