# Plano de Implementação — Seção de Idiomas

Status: Proposta  
Data: 2026-10-05  
Spec: `spec/03-features/secao-idiomas/spec.md`  
Tarefas: `spec/04-plano/secao-idiomas/tarefas.md`

---

## 1. Arquitetura e Decisões Técnicas

1. **Modelagem de Domínio (`portfolio-content.models.ts`)**:
   - Criar interface `PortfolioLanguageEntry`:
     ```ts
     export interface PortfolioLanguageEntry {
       id: string;
       name: string;
       level: string;
       displayOrder: number;
     }
     ```
   - Adicionar chaves de copy em `PortfolioCopy` para título e subtítulo da seção:
     - `languagesTitle: string`
     - `languagesBody: string`

2. **Snapshot e Validação Editorial**:
   - Adicionar `'languages'` à lista de seções válidas em `SECTION_KINDS` (`editorial-snapshot.models.ts` e `editorial-snapshot.validator.ts`).
   - Adicionar `'language'` à lista de entidades válidas em `ENTITY_KINDS` e `ENTITY_DATA_FIELDS`.
   - Implementar adaptador `snapshotToLanguages()` em `editorial-snapshot-adapter.ts`.
   - Atualizar `generate-joao-editorial-snapshot.mjs` para gerar as entidades `language` e suas traduções (`pt-BR` e `en`).

3. **Serviços de Conteúdo**:
   - Adicionar método `listLanguages(locale: PortfolioLocale): Promise<PortfolioLanguageEntry[]>` em:
     - `PortfolioContentService` (com fallback estático para desenvolvimento offline).
     - `PublishedSnapshotContentService` (lendo as entidades publicadas do snapshot).

4. **Componente de Apresentação e Template (`portfolio-page`)**:
   - Incluir sinal `languages = signal<PortfolioLanguageEntry[]>([])`.
   - No template `portfolio-page.html`, criar a seção `<section id="idiomas" class="portfolio-section">` antes de `#contato`.
   - Adicionar item de navegação `languagesTitle` apontando para `#idiomas`.
   - Estilização em `portfolio-page.scss` seguindo os padrões visuais existentes (cards alinhados em grid responsivo).

5. **Banco de Dados (Supabase Migration)**:
   - Migration idempotente adicionando suporte a `kind = 'language'` em `portfolio_editorial.draft_entities` (ou adaptação do check constraint se necessário) e inclusão da seção no snapshot ativo.

---

## 2. Estratégia de Verificação

- Testes unitários para `snapshotToLanguages` em `editorial-snapshot-adapter.spec.ts`.
- Testes unitários para o validador em `editorial-snapshot.validator.spec.ts`.
- Testes em `portfolio-page.spec.ts` cobrindo a renderização dos idiomas nos dois locales (`pt-BR` e `en`) e a navegação.
- Execução completa da suíte de testes com `npm test`.
