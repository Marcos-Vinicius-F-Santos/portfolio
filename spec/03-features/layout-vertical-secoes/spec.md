# Spec da Feature — Layout vertical das seções

> **Reconciliação editorial — 2026-09-26:** Composição continua responsiva e vertical; ordem das seções abaixo da apresentação passa a ser editorial. Header/apresentação não se movem, e o menu acompanha âncoras estáveis. A [spec de edição visual](../edicao-visual-rascunho-publicacao/spec.md) prevalece nesses pontos quando implantada. Os requisitos anteriores continuam referência para o comportamento não alterado e a regressão; esta nota não comprova implementação ou testes.

Status: Aprovada
Projeto: Portfólio Profissional — Marcos Santos  
Onde vive no código: `src/app/features/portfolio/presentation/`

## 1. Objetivo

Alterar a organização visual das seções da página pública para que elas sejam exibidas
em uma única coluna vertical, uma abaixo da outra, em vez do grid atual com três colunas.

Essa mudança entra para melhorar a visualização do conteúdo das seções do portfólio.

## 2. Como funciona hoje

A página pública exibe as seções em três colunas lado a lado. As seções atualmente
apresentadas são “Sobre mim”, “Experiências” e “Stack técnica”.

## 3. Requisitos funcionais

### FR-001

QUANDO a página pública for renderizada  
O SISTEMA DEVE exibir as seções em uma única coluna vertical, posicionando uma seção
abaixo da outra e substituindo a disposição atual em três colunas.

### FR-002

QUANDO a página pública for renderizada  
O SISTEMA DEVE posicionar a seção “Sobre mim” primeiro, a seção “Stack técnica” em
seguida e as demais seções posteriormente.

## 4. Regras de negócio

Nenhuma regra de negócio foi identificada para esta feature.

## 5. Critério de aceite

### AC-001 — caminho feliz

Dado que a página pública contenha as seções “Sobre mim”, “Experiências” e “Stack
técnica”  
Quando o usuário acessar a página  
Então as seções devem ser exibidas em uma única coluna, nesta ordem: “Sobre mim”, “Stack
técnica” e depois as demais seções, sem duas ou mais seções lado a lado.

### AC-002 — caminho de erro

Dado que o conteúdo de uma seção exceda o espaço horizontal disponível  
Quando a página for renderizada no layout de uma coluna  
Então o conteúdo excedente deve ser distribuído verticalmente dentro da própria coluna,
sem sobreposição, corte do conteúdo ou retorno ao layout de três colunas.

## 6. Casos de erro / edge cases

- Conteúdo extenso em uma seção deve ser quebrado e distribuído verticalmente dentro da
  própria coluna.
- O layout não deve retornar automaticamente para três colunas quando o conteúdo de uma
  seção for maior que o espaço horizontal disponível.

## 7. Fora de escopo desta feature

- Alteração do conteúdo textual ou dos dados das seções.
- Alteração da navegação entre as seções.
- Alteração da identidade visual, cores, tipografia ou componentes, exceto o necessário
  para aplicar a disposição em uma coluna.
- Alteração da área administrativa ou da persistência de conteúdo no Supabase.
- Criação de novas seções.
- Alteração de outras páginas ou funcionalidades do portfólio.

## 8. Suposições e perguntas abertas

- [x] Decisão confirmada: a disposição desejada para as seções é de apenas uma coluna,
      com as seções uma abaixo da outra.
- [x] Decisão confirmada: a regra de uma coluna vale em todos os tamanhos de tela
      suportados pela página pública, e não somente na visualização desktop atual.
- [x] Decisão confirmada: a ordem deve começar por “Sobre mim”, seguida de “Stack
      técnica”, e depois pelas demais seções.
- [x] Decisão confirmada: caso o conteúdo de uma seção exceda a largura disponível, ele
      deve ser redirecionado e distribuído verticalmente dentro da própria coluna, sem
      sobreposição ou corte.

## 9. Definition of Done desta feature

- [ ] Critérios de aceite da seção 5 satisfeitos.
- [ ] As seções são exibidas em uma única coluna vertical.
- [ ] O conteúdo das seções continua visível sem sobreposição ou corte.
- [ ] Casos de erro de prioridade alta tratados.
- [ ] Features existentes continuam funcionando — regressão checada.
- [ ] Testado seguindo `specs/05-verificacao/plano-de-teste-template.md`.
- [ ] Eu revisei e aprovei antes do deploy.






