# Checklist de Convergência — Componentes reutilizáveis do painel administrativo

Status: Revisão concluída — deploy não aprovado
Data: 2026-10-06
Commit revisado: working tree atual — esta feature ainda não possui commit próprio

Spec relacionada: `spec/03-features/reusable-components/spec.md`
Plano relacionado: `spec/04-plano/reusable-components/plano.md`
Tarefas relacionadas: `spec/04-plano/reusable-components/tarefas.md`

## Resumo da revisão

A comparação foi feita entre a Spec da Feature, o plano/tarefas, o código em `src/app/` e
os testes Vitest. Os requisitos funcionais FR-001 a FR-005 e os critérios de aceite AC-001
a AC-004 convergem com a implementação: os quatro componentes administrativos compartilhados
foram criados, as duas telas administrativas foram migradas e a suíte completa passou.

O deploy permanece não aprovado por esta revisão. A documentação de deploy e rollback foi
alinhada ao procedimento existente, mas nenhuma Preview, promoção ou rollback real foi
executado nesta rodada. Também não há commit próprio desta feature, script de lint ou
evidência visual de viewport feita em navegador nesta revisão.

## Rastreio Spec ↔ Plano/Tarefas ↔ Código ↔ Testes

| Requisito | Código | Teste/evidência | Status |
|---|---|---|---|
| FR-001 — cabeçalho de página compartilhado | `src/app/shared/ui/admin-page-header/` e imports/templates de `content-management` e `media-management` | `admin-page-header.spec.ts`, testes das duas features e build aprovado | Confirmado |
| FR-002 — cabeçalho de seção compartilhado | `src/app/shared/ui/admin-section-header/` e imports/templates administrativos | `admin-section-header.spec.ts`, testes das duas features e build aprovado | Confirmado |
| FR-003 — feedback de status, erro e sucesso com semântica preservada | `src/app/shared/ui/admin-feedback/` e estados dos dois templates administrativos | `admin-feedback.spec.ts`, `data-testid` preservados e suíte completa aprovada | Confirmado |
| FR-004 — cartão compartilhado com variantes | `src/app/shared/ui/admin-card/` e usos padrão, `image` e `dashed` nas duas telas | `admin-card.spec.ts`, testes das telas e build aprovado | Confirmado |
| FR-005 — tokens e estilos administrativos compartilhados | `src/app/shared/ui/admin-ui.scss` e mixins usados nos estilos das duas features | `git diff --check`, build aprovado e inspeção dos estilos | Confirmado |
| AC-004 — regressão mínima | Componentes e templates migrados sem alteração de serviços ou regras de domínio | 34 arquivos de teste e 162 testes aprovados | Confirmado funcionalmente; sem validação visual em navegador nesta rodada |

## Requisitos

- [x] Todo comportamento implementado corresponde a um requisito da Spec ou está documentado como decisão consciente fora da Spec.
  - A implementação está limitada à apresentação administrativa compartilhada. Não foram
    extraídos cartões públicos, campos de formulário ou regras de domínio.
- [x] O critério de aceite reflete o comportamento final de verdade.
  - AC-001: as duas telas usam cabeçalho de página e cabeçalho de seção compartilhados.
  - AC-002: estados de carregamento, erro e sucesso usam `AdminFeedback`, mantendo roles e
    `data-testid` existentes.
  - AC-003: editores e mídias usam `AdminCard` com as variantes adequadas.
  - AC-004: a suíte completa e o build foram executados com sucesso.

## Arquitetura

- [x] A estrutura de pastas/módulos respeita `spec/02-arquitetura/ARQUITETURA.md`.
  - Os componentes vivem em `src/app/shared/ui`, o local aprovado para elementos realmente
    compartilhados entre features; a lógica continua nas features administrativas.
- [x] Nenhum limite arquitetural foi cruzado.
  - Não houve chamada direta a banco em componentes de apresentação, migration, mudança de
    Auth, Supabase, Storage ou fluxo público.

## Dados

- [x] Migration testada, se houve mudança de schema — não aplicável; esta feature não altera
      banco, Storage, Supabase ou variáveis de ambiente.
- [x] Existe procedimento de rollback compatível com a natureza da mudança.
  - O plano define rollback somente do frontend para o último deployment Production `Ready`
    e proíbe `db reset`, SQL destrutivo, alteração de policy ou revogação de chaves para uma
    falha de UI.
- [ ] Rollback executado nesta revisão — não confirmado; nenhuma falha exigiu rollback.

## Testes

- [x] Requisitos de prioridade alta têm verificação feita.
  - O plano não atribui prioridades numéricas; foram verificados os caminhos principais de
    todos os FRs e os erros/edge cases mais óbvios dos componentes compartilhados.
- [x] Regressão checada — não há indício funcional de regressão.
  - A suíte completa passou após a migração das duas telas administrativas.
- [x] Suíte automatizada executada: 34 arquivos de teste e 162 testes aprovados.
- [x] Build de produção executado com sucesso via `npm run build`.
  - Permanecem apenas os avisos já conhecidos de orçamento do bundle inicial e do stylesheet
    da página pública.
- [x] Checagem equivalente de formatação executada via `git diff --check`.
- [ ] Lint — não pôde ser confirmado porque o projeto não possui script `lint` configurado.
- [ ] Validação visual em navegador — não pôde ser confirmada nesta revisão; a responsividade
      está definida nos estilos, mas não foi feita uma inspeção de viewport real.

## Entrega

- [x] O procedimento de deploy corresponde ao que realmente será feito.
  - O plano referencia `spec/06-deploy/area-administrativa-autenticada/deploy.md`, que exige
    revisão do diff, gates locais, Preview na Vercel, validação pública/admin e aprovação
    explícita antes da promoção.
- [ ] O rollback foi executado e comprovado — não confirmado; o procedimento está documentado,
      mas não houve deploy ou incidente nesta rodada.
- [ ] Existe um commit próprio versionado da implementação — não confirmado; as alterações
      permanecem no working tree sem commit desta feature.
- [x] Nenhum deploy foi executado ou aprovado por esta revisão.

## Divergências encontradas

1. Não foi encontrado desvio funcional entre FR-001 a FR-005, AC-001 a AC-004 e o código
   revisado.
2. A implementação permanece sem commit próprio; portanto, a reversão por histórico Git da
   feature ainda não está disponível como mecanismo comprovado.
3. O procedimento de deploy/rollback está alinhado e documentado, mas não foi executado em
   Preview, produção ou rollback nesta revisão.
4. O projeto não possui script de lint. A checagem equivalente disponível foi
   `git diff --check`, além da suíte e do build.
5. A responsividade do cartão de imagem está implementada no CSS, mas não foi confirmada por
   inspeção visual em navegador nesta rodada.

## Decisão do portão

- [x] Convergência funcional confirmada para FR-001 a FR-005 e AC-001 a AC-004.
- [ ] Deploy aprovado — permanece pendente de decisão de Marcos.
- [ ] Checklist de entrega/rollback totalmente confirmado — pendente de commit próprio,
      validação visual e execução operacional de Preview/rollback.
