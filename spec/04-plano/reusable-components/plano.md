# Plano de Implementação — Componentes reutilizáveis do painel administrativo

Spec relacionada: `spec/03-features/reusable-components/spec.md`
Status: Aprovado

## 1. Resumo técnico

Criar componentes standalone em `src/app/shared/ui` para os padrões já repetidos nas telas
administrativas de conteúdo e mídias: cabeçalho de página, cabeçalho de seção, feedback e
cartão. Extrair tokens e mixins visuais administrativos para `admin-ui.scss`, mantendo os
componentes específicos do portfólio público dentro das próprias features.

A implementação será feita somente depois da aprovação deste plano e da spec relacionada.
Nenhuma tabela, migration, fluxo de autenticação, regra de validação ou comportamento de
publicação será alterado.

## 2. Impacto no que já existe

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/app/features/admin/content-management/content-management.html` | Substituir cabeçalho, feedback, títulos de seção e cartões locais pelos componentes compartilhados | Médio: bindings e `data-testid` precisam permanecer iguais |
| `src/app/features/admin/content-management/content-management.scss` | Remover estilos duplicados e consumir tokens/mixins administrativos | Baixo: risco visual localizado na tela de conteúdo |
| `src/app/features/admin/content-management/content-management.ts` | Importar os componentes standalone compartilhados | Baixo: nenhuma lógica de domínio será alterada |
| `src/app/features/admin/media-management/media-management.html` | Substituir cabeçalho, feedback, títulos de seção e cartões locais pelos componentes compartilhados | Médio: preservar variantes de imagem e tracejada |
| `src/app/features/admin/media-management/media-management.scss` | Remover estilos duplicados e consumir tokens/mixins administrativos | Médio: preservar responsividade dos cartões de imagem |
| `src/app/features/admin/media-management/media-management.ts` | Importar os componentes standalone compartilhados | Baixo: nenhuma operação de mídia será alterada |
| Testes existentes das duas telas | Atualizar apenas se o contrato visual compartilhado exigir ajuste | Baixo: manter os testes de fluxo e identificadores atuais |

## 3. Componentes novos

Serão criados, caso a spec seja aprovada:

- `src/app/shared/ui/admin-page-header/` — eyebrow, título, descrição e ações projetadas.
- `src/app/shared/ui/admin-section-header/` — título, descrição opcional e ações projetadas.
- `src/app/shared/ui/admin-feedback/` — estados de status, erro e sucesso, com `role` e `data-testid`.
- `src/app/shared/ui/admin-card/` — cartão padrão com variantes padrão, imagem e tracejada.
- `src/app/shared/ui/admin-ui.scss` — tokens, mixins de campos, botões, feedback e cópia auxiliar.

Cada componente terá teste unitário mínimo para projeção de conteúdo, variantes e semântica de
acessibilidade relevante.

## 4. Mudança de dados/banco (se houver)

Não haverá mudança de dados ou banco. Não será criada migration nem será necessário rollback de
schema. O rollback da implementação consiste em restaurar os templates e estilos das duas telas
e remover `src/app/shared/ui`.

## 5. Sequência de implementação

### Fase 1 — Base

- Confirmar aprovação da spec e deste plano.
- Criar a estrutura `src/app/shared/ui` e os tokens de `admin-ui.scss`.
- Criar os contratos de input e projeção dos quatro componentes.

### Fase 2 — Lógica principal

- Implementar as variantes do cartão.
- Implementar as variantes de feedback e os papéis de acessibilidade.
- Garantir que os componentes não contenham lógica de domínio, Supabase ou publicação.

### Fase 3 — Interface

- Migrar `content-management`.
- Migrar `media-management`.
- Preservar textos, eventos, bindings, `data-testid`, estados de carregamento/erro/sucesso e
  responsividade.
- Remover somente a duplicação de estilos que passar a ser coberta pelos tokens/mixins.

### Fase 4 — Testes

- Adicionar testes unitários para os quatro componentes.
- Executar a suíte completa com `npm test -- --watch=false --no-progress`.
- Executar `npm run build`.
- Revisar `git diff --check` e comparar o diff com a spec e este plano.

### Fase 5 — Entrega (deploy/rollback)

- Seguir o procedimento operacional de
  `spec/06-deploy/area-administrativa-autenticada/deploy.md`: revisar o working tree e o
  diff, instalar o lockfile, executar os gates locais, criar uma Preview na Vercel e validar
  a página pública e a área administrativa antes de qualquer promoção.
- Esta feature é somente frontend e não cria migration, altera Supabase, Auth, Storage ou
  variáveis de ambiente. Nenhum comando de banco é necessário para sua entrega.
- Não fazer commit, push, promoção ou deploy sem revisão e autorização explícitas de Marcos.
- Se houver regressão visual, erro fatal, falha de rota ou acesso administrativo indevido,
  executar primeiro o rollback do frontend para o último deployment Production `Ready`,
  conforme o procedimento existente. Não usar `db reset`, `DROP TABLE`, remoção de dados,
  alteração de policy ou revogação de chaves como resposta a uma falha do frontend.
- Depois do rollback, confirmar a página pública e registrar o incidente; uma nova tentativa
  exige nova correção, testes, build, Preview, validação e aprovação.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar |
|---|---|---|---|
| Perda de bindings ou `data-testid` durante a migração dos templates | Média | Alto | Migrar por tela, preservar contratos existentes e executar os testes de componente |
| Diferença visual entre conteúdo e mídias após remover estilos locais | Média | Médio | Manter variantes explícitas e revisar o diff de estilos/build |
| Cartão de imagem perder responsividade | Baixa | Médio | Manter variante `image` e validar breakpoint de telas estreitas |
| Abstração crescer para regras específicas de uma feature | Média | Alto | Limitar o shared à apresentação administrativa e manter conteúdo por projeção |
| Falha de compilação por imports standalone ou Sass | Baixa | Alto | Compilar após a criação da base e antes da migração completa |

## 7. Perguntas abertas antes de começar

- [x] A spec relacionada foi aprovada por Marcos.
- [x] Marcos aprova este plano de implementação.
- [x] A pasta `src/app/shared/ui` é o local aprovado para os componentes administrativos
      compartilhados.
- [x] O escopo permanece limitado a S1–S4, sem extrair cartões públicos ou campos de formulário.
