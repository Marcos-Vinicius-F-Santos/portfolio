# Spec da Feature — Componentes reutilizáveis do painel administrativo

Status: Aprovada
Projeto: portfolio
Onde vive no código: `src/app/shared/ui` e features administrativas

## 1. Objetivo

Consolidar padrões visuais realmente repetidos entre as telas administrativas de conteúdo e
mídias. A feature reduz duplicação sem misturar a linguagem visual específica do portfólio
público com a área administrativa.

## 2. Como funciona hoje

As telas `content-management` e `media-management` repetem cabeçalhos, títulos de seção,
mensagens de carregamento/erro/sucesso, cartões, controles de formulário e tokens visuais.
Cada tela mantém sua própria cópia desses padrões.

## 3. Requisitos funcionais

### FR-001
QUANDO uma tela administrativa precisar de um cabeçalho de página
O SISTEMA DEVE permitir renderizar eyebrow, título, descrição e ações por meio de um componente
compartilhado.

### FR-002
QUANDO uma seção administrativa precisar de título, descrição e ações
O SISTEMA DEVE permitir renderizar esses elementos por meio de um componente compartilhado.

### FR-003
QUANDO uma tela administrativa informar carregamento, erro ou sucesso
O SISTEMA DEVE renderizar a mensagem por meio de um componente compartilhado, preservando
semântica de acessibilidade e os identificadores de teste existentes.

### FR-004
QUANDO conteúdo administrativo precisar de um cartão visual
O SISTEMA DEVE permitir usar um cartão compartilhado com variantes padrão, de imagem e tracejada.

### FR-005
QUANDO os componentes administrativos forem usados
O SISTEMA DEVE manter tokens de cor, espaçamento, controles e estados desabilitados em um único
arquivo de estilos reutilizável.

## 4. Regras de negócio

### BR-001
Os componentes compartilhados pertencem ao domínio administrativo e não devem impor a linguagem
visual do portfólio público.

### BR-002
A extração não pode alterar textos, ações, fluxos de salvamento ou regras de validação existentes.

### BR-003
Os componentes devem aceitar conteúdo por projeção quando a tela precisar fornecer botões ou
conteúdo específico da feature.

## 5. Critério de aceite

### AC-001 — cabeçalhos compartilhados
Dado o gerenciamento de conteúdo e o gerenciamento de mídias
Quando as telas forem renderizadas
Então ambas usam os componentes compartilhados de cabeçalho de página e seção.

### AC-002 — feedback compartilhado
Dado qualquer estado de carregamento, erro ou sucesso das duas telas
Quando o estado for exibido
Então a mensagem usa o componente compartilhado e mantém `role` e `data-testid`.

### AC-003 — cartões compartilhados
Dado um editor ou cartão de mídia
Quando a tela for renderizada
Então o contêiner visual usa o cartão compartilhado com a variante adequada.

### AC-004 — regressão
Dado o conjunto atual de testes
Quando a suíte e o build forem executados
Então os fluxos administrativos existentes continuam passando sem alteração funcional.

## 6. Casos de erro / edge cases

- Mensagem vazia não deve renderizar o componente de feedback; a decisão continua nas telas
  consumidoras.
- Descrição opcional de seção não deve criar um parágrafo vazio.
- Conteúdo projetado deve continuar controlando seus próprios eventos e bindings.
- A variante de imagem deve continuar responsiva em telas estreitas.

## 7. Fora de escopo desta feature

- Extrair cartões do portfólio público.
- Criar um cartão universal para todos os domínios.
- Extrair campos de formulário ou componentes de edição de entidades.
- Alterar os fluxos de autenticação, Supabase, publicação ou validação.

## 8. Suposições e perguntas abertas

- [x] A pasta compartilhada será `src/app/shared/ui`, conforme a arquitetura e a auditoria de
  reuso real.
- [x] O primeiro consumidor dos componentes será o painel administrativo.

## 9. Definition of Done desta feature

- [ ] Critério de aceite (seção 5) satisfeito
- [ ] Casos de erro de prioridade alta tratados
- [ ] Features existentes continuam funcionando (regressão checada)
- [ ] Testado seguindo `spec/05-verificacao`
- [ ] Procedimento de deploy e rollback revisado conforme
      `spec/06-deploy/area-administrativa-autenticada/deploy.md`
- [ ] Eu revisei e aprovei antes do deploy
