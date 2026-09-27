# Spec da Feature — Resultados profissionais

> **Reconciliação editorial — 2026-09-26:** Textos/valores e ordem dos blocos serão editáveis no rascunho, sem gerar alegações automaticamente. Publicação depende de confirmação do conjunto. A [spec de edição visual](../edicao-visual-rascunho-publicacao/spec.md) prevalece nesses pontos quando implantada. Os requisitos anteriores continuam referência para o comportamento não alterado e a regressão; esta nota não comprova implementação ou testes.

Status: Aprovada  
Projeto: Portfólio Profissional — Marcos Santos  
Onde vive no código: `src/app/features/portfolio/presentation/` (seção da página pública)

## 1. Objetivo

Criar uma seção na página pública e única do portfólio para apresentar, de forma
objetiva e contextualizada, os principais resultados profissionais de Marcos. A seção
deve destacar resultados relacionados à redução de tempo, redução de etapas, quantidade
de usuários atendidos e ganhos de produtividade.

## 2. Como funciona hoje (só se for mudança em algo que já existe)

Não se aplica. O produto é novo e a seção de resultados profissionais ainda não existe.

## 3. Requisitos funcionais

### FR-001

QUANDO o visitante acessar a página pública do portfólio  
O SISTEMA DEVE disponibilizar uma seção dedicada aos principais resultados profissionais.

### FR-002

QUANDO a seção de resultados profissionais for exibida  
O SISTEMA DEVE apresentar resultados relacionados à redução de tempo.

### FR-003

QUANDO a seção de resultados profissionais for exibida  
O SISTEMA DEVE apresentar resultados relacionados à redução de etapas.

### FR-004

QUANDO a seção de resultados profissionais for exibida  
O SISTEMA DEVE apresentar a quantidade de usuários atendidos.

### FR-005

QUANDO a seção de resultados profissionais for exibida  
O SISTEMA DEVE apresentar resultados relacionados a ganhos de produtividade.

### FR-006

QUANDO um resultado profissional for apresentado  
O SISTEMA DEVE exibir o resultado de forma objetiva e contextualizada, sem criar valores
ou afirmações que não tenham sido aprovados para publicação.

### FR-007

QUANDO o visitante alternar o idioma da página pública  
O SISTEMA DEVE apresentar o conteúdo da seção no idioma selecionado quando a tradução
correspondente estiver disponível e usar o conteúdo original como fallback quando ela
estiver ausente, seguindo a estrutura de traduções definida para o produto.

## 4. Regras de negócio

### BR-001

A seção deve apresentar somente resultados profissionais aprovados para divulgação.

### BR-002

Os resultados devem permanecer contextualizados e não podem expor informações
confidenciais de empresas, clientes ou sistemas internos.

### BR-003

A seção pertence à experiência pública de página única do portfólio e não deve criar uma
nova página pública.

### BR-004

O conteúdo em português e inglês deve permanecer em uma estrutura de traduções separada
do conteúdo principal, conforme definido na arquitetura do produto.

### BR-005

Quando somente parte das categorias possuir resultados aprovados, a seção deve exibir os
resultados disponíveis e não deve aguardar conteúdo para todas as categorias.

## 5. Critério de aceite

### AC-001 — caminho feliz

Dado que existam resultados profissionais aprovados para publicação nas categorias de
redução de tempo, redução de etapas, usuários atendidos e ganhos de produtividade  
Quando o visitante acessar a página pública do portfólio  
Então o sistema deve apresentar a seção de resultados profissionais com esses resultados
de forma objetiva e contextualizada.

### AC-002 — caminho de erro

Dado que não exista nenhum resultado profissional aprovado para publicação  
Quando o visitante acessar a página pública do portfólio  
Então o sistema não deve renderizar uma seção com conteúdo vazio, inventado ou não
aprovado.

### AC-003 — idioma selecionado

Dado que o visitante tenha selecionado um idioma e exista tradução aprovada da seção  
Quando a página pública for exibida  
Então o sistema deve apresentar a seção no idioma selecionado.

### AC-004 — fallback de idioma

Dado que o visitante tenha selecionado um idioma e não exista tradução aprovada para um
resultado  
Quando a página pública for exibida  
Então o sistema deve apresentar o conteúdo original aprovado desse resultado.

## 6. Casos de erro / edge cases

- Nenhum resultado aprovado: a seção não deve ser renderizada.
- Apenas parte das categorias possui conteúdo aprovado: a seção deve exibir somente os
  resultados disponíveis.
- Tradução de um resultado ausente no idioma selecionado: deve ser usado o conteúdo
  original aprovado.
- Resultado sem contexto suficiente para interpretação: não deve ser publicado até que
  o contexto seja aprovado.
- Resultado com informação confidencial: não deve ser exibido na página pública.

## 7. Fora de escopo desta feature

- Definição ou alteração do schema, migrations, políticas RLS ou buckets do Supabase.
- Criação da área administrativa para cadastrar ou editar resultados.
- Cálculo automático, auditoria ou validação independente dos valores dos resultados.
- Gráficos, filtros, ordenação interativa ou comparação entre resultados.
- Seções de apresentação, “Sobre mim”, experiências, projetos, habilidades, formação,
  contato ou currículos.
- Criação de uma nova página pública ou alteração do fluxo de página única.
- Publicação de nomes reais de empresas, clientes ou informações confidenciais.
- Refinamento definitivo da identidade visual do portfólio.

## 8. Suposições e perguntas abertas

- [x] Suposição: a seção será pública, somente para leitura e ficará na composição da
      página única, em `src/app/features/portfolio/presentation/`, conforme a
      arquitetura.
- [x] Suposição: o título inicial da seção será “Resultados profissionais”, sujeito à
      revisão de Marcos.
- [x] Suposição: resultados sem conteúdo aprovado não devem ser inventados nem
      renderizados como se fossem resultados reais.
- [x] Decisão: quando somente parte das quatro categorias tiver conteúdo aprovado, a
      seção deve exibir os resultados disponíveis.
- [x] Decisão: cada resultado, incluindo seus valores, unidades e contexto, será
      considerado aprovado individualmente quando Marcos disser que está aprovado. A
      feature não deve acrescentar ou alterar números sem essa aprovação.
- [x] Decisão: quando faltar a tradução de um resultado no idioma selecionado, deve ser
      usado o conteúdo original aprovado, seguindo o comportamento geral da aplicação.
- [x] Suposição: o cadastro e a edição dos resultados pela área administrativa ficam
      fora desta feature e serão tratados na feature de gestão de conteúdo.

## 9. Definition of Done desta feature

- [ ] Critério de aceite (seção 5) satisfeito.
- [ ] Casos de erro de prioridade alta tratados ou explicitamente resolvidos nas
      perguntas abertas.
- [ ] Conteúdo e valores dos resultados revisados e aprovados por Marcos.
- [ ] Features existentes continuam funcionando (regressão checada).
- [ ] Testado seguindo `specs/05-verificacao/plano-de-teste-template.md`.
- [ ] Eu revisei e aprovei antes do deploy.
