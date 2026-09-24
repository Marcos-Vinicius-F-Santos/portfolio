# Spec da Feature — Projetos profissionais e pessoais

Status: Aprovada  
Projeto: Portfólio Profissional — Marcos Santos  
Onde vive no código: `src/app/features/portfolio/presentation/` (apresentação pública) e `src/app/features/portfolio/content/` (estrutura do conteúdo)

## 1. Objetivo

Criar uma estrutura na página pública do portfólio para apresentar projetos
profissionais e pessoais com nome ou título, descrição, contexto, papel
desempenhado, decisões técnicas, tecnologias, resultados, aprendizados e links
relacionados.

Essa feature viabiliza que os projetos sejam apresentados de forma estruturada,
sem exigir uma alteração na estrutura principal da página quando novos projetos
forem adicionados.

## 2. Como funciona hoje (só se for mudança em algo que já existe)

Não se aplica como alteração de um comportamento existente. A página pública
atual ainda não apresenta projetos. Embora o projeto já possua estruturas de
dados e serviço de leitura relacionados a projetos, não há uma seção pública
renderizada para eles.

## 3. Requisitos funcionais

### FR-001

QUANDO existirem projetos disponíveis para apresentação e o visitante acessar a página pública do portfólio  
O SISTEMA DEVE apresentar os projetos em subseções separadas para projetos profissionais e projetos pessoais.

### FR-002

QUANDO um projeto for apresentado  
O SISTEMA DEVE exibir o nome ou título do projeto.

### FR-003

QUANDO um projeto for apresentado  
O SISTEMA DEVE indicar se ele pertence à subseção de projetos profissionais ou à subseção de projetos pessoais.

### FR-004

QUANDO um projeto for apresentado  
O SISTEMA DEVE exibir a descrição do projeto.

### FR-005

QUANDO um projeto for apresentado  
O SISTEMA DEVE exibir o contexto do projeto.

### FR-006

QUANDO um projeto for apresentado  
O SISTEMA DEVE exibir o papel desempenhado no projeto.

### FR-007

QUANDO um projeto for apresentado  
O SISTEMA DEVE exibir as decisões técnicas relacionadas ao projeto.

### FR-008

QUANDO um projeto for apresentado  
O SISTEMA DEVE exibir as tecnologias utilizadas no projeto.

### FR-009

QUANDO um projeto for apresentado  
O SISTEMA DEVE exibir os resultados do projeto.

### FR-010

QUANDO um projeto for apresentado  
O SISTEMA DEVE exibir os aprendizados relacionados ao projeto.

### FR-011

QUANDO um projeto possuir links relacionados  
O SISTEMA DEVE apresentar esses links junto ao projeto.

### FR-012

QUANDO não existirem projetos disponíveis para apresentação  
O SISTEMA NÃO DEVE exibir a seção de projetos nem seu item de navegação.

### FR-013

QUANDO o visitante alternar o idioma da página pública  
O SISTEMA DEVE apresentar os textos dos projetos no idioma selecionado, seguindo a estrutura de traduções definida para o produto.

## 4. Regras de negócio

### BR-001

A apresentação deve possuir uma subseção para projetos profissionais e outra para
projetos pessoais.

### BR-002

Cada projeto apresentado deve possuir nome ou título, descrição, contexto, papel
desempenhado, decisões técnicas, tecnologias, resultados e aprendizados.

### BR-003

Todos os campos definidos para um projeto são obrigatórios para sua apresentação.

### BR-004

Os links relacionados a um projeto devem ser apresentados como parte das informações desse projeto, quando existirem, usando os campos label e url, sem exigência de validação prévia por esta feature.

### BR-005

Os textos dos projetos devem seguir a alternância entre português e inglês já
definida para o produto.

### BR-006

Projetos profissionais relacionados a empresas, clientes ou sistemas internos
não devem expor informações confidenciais.

## 5. Critério de aceite

### AC-001 — caminho feliz

Dado que existam projetos profissionais e pessoais disponíveis para apresentação,
com todos os campos obrigatórios preenchidos  
Quando o visitante acessar a página pública do portfólio  
Então o sistema deve apresentar duas subseções, uma para projetos profissionais
e outra para projetos pessoais, exibindo em cada projeto seu nome ou título,
descrição, contexto, papel desempenhado, decisões técnicas, tecnologias,
resultados, aprendizados e links relacionados quando existirem.

### AC-002 — caminho de erro: ausência de projetos

Dado que não existam projetos disponíveis para apresentação  
Quando o visitante acessar a página pública do portfólio  
Então o sistema não deve exibir a seção de projetos nem seu item de navegação.

### AC-003 — caminho de erro: conteúdo confidencial

Dado que um projeto profissional contenha informação confidencial  
Quando o projeto for preparado para apresentação pública  
Então a informação confidencial não deve ser exibida como parte do projeto.

### AC-004 — idioma selecionado

Dado que o visitante tenha selecionado um idioma e existam traduções aprovadas
dos textos dos projetos  
Quando a página pública for exibida  
Então o sistema deve apresentar os textos dos projetos no idioma selecionado.

### AC-005 — fallback para pt-BR

Dado que o visitante tenha selecionado inglês e não exista tradução aprovada para um projeto
Quando a página pública for exibida
Então o sistema deve apresentar o conteúdo aprovado correspondente ao idioma padrão pt-BR.

## 6. Casos de erro / edge cases

- Nenhum projeto disponível: não exibir a seção de projetos nem seu item de
  navegação.
- Projeto sem nome ou sem algum dos campos obrigatórios: não apresentar o projeto
  como projeto disponível.
- Projeto sem links relacionados: não exibir um link vazio ou fictício.
- Link relacionado inválido ou indisponível: a feature não exige validação prévia
  do link.
- Projeto profissional com informação confidencial: a informação não deve ser
  apresentada publicamente.
- Projetos profissionais e pessoais simultaneamente disponíveis: cada tipo deve
  ser exibido em sua subseção correspondente.
- Tradução ausente no idioma selecionado: usar o conteúdo correspondente ao idioma padrão pt-BR.

## 7. Fora de escopo desta feature

- Cadastro, edição ou exclusão de projetos pela área administrativa.
- Definição de fluxo de rascunho, revisão ou publicação.
- Alterações de schema, políticas RLS ou buckets do Supabase que não sejam necessárias para persistir o tipo profissional/pessoal desta feature.
- Upload, exibição ou gerenciamento de imagens dos projetos.
- Criação de interface pública para ordenar interativamente os projetos dentro de cada subseção; a ordem é fornecida pelo campo editável display_order.
- Criação de uma nova página pública ou alteração do fluxo de página única.
- Alteração das seções existentes de apresentação, sobre mim, experiências,
  resultados, habilidades, formação, contato ou currículos.
- Definição de conteúdo específico, números de resultados ou afirmações que não
  tenham sido aprovados para publicação.

## 8. Suposições e perguntas abertas

- [x] Suposição: a feature será uma nova seção da página pública única, pois não
      existe apresentação de projetos atualmente.
- [x] Decisão confirmada: o nome ou título do projeto é obrigatório.
- [x] Decisão confirmada: descrição, contexto, papel desempenhado, decisões
      técnicas, tecnologias, resultados e aprendizados são obrigatórios.
- [x] Decisão confirmada: quando não houver projetos, a seção e seu item de
      navegação não devem ser exibidos.
- [x] Decisão confirmada: projetos profissionais e pessoais devem ser exibidos
      em subseções separadas.
- [x] Decisão confirmada: links relacionados podem ser links em geral e não
      precisam ser validados previamente por esta feature.
- [x] Decisão confirmada: os textos dos projetos devem seguir a alternância entre português e inglês do produto.
- [x] Decisão confirmada: a classificação profissional/pessoal será persistida em portfolio_projects por migration versionada.
- [x] Decisão confirmada: uma subseção sem projetos correspondentes não deve ser exibida.
- [x] Decisão confirmada: quando faltar tradução no idioma selecionado, o fallback será o conteúdo aprovado em pt-BR.
- [x] Decisão confirmada: os links serão representados pelos campos label e url, sem validação prévia.
- [x] Decisão confirmada: a revisão de confidencialidade será manual.
- [x] Suposição: informações confidenciais não podem ser apresentadas em
      projetos profissionais, em conformidade com os limites do produto e da
      arquitetura.
- [x] Decisão confirmada: a ordem dos projetos dentro de cada
      subseção deve permanecer aberta para edição posterior por Marcos.

## 9. Definition of Done desta feature

- [ ] Critérios de aceite da seção 5 satisfeitos.
- [ ] Casos de erro de prioridade alta tratados ou explicitamente resolvidos nas
      perguntas abertas.
- [ ] A estrutura e o conteúdo dos projetos foram revisados e aprovados por
      Marcos.
- [ ] Features existentes continuam funcionando (regressão checada).
- [ ] Testado seguindo `specs/05-verificacao/plano-de-teste-template.md`.
- [ ] Eu revisei e aprovei antes do deploy.
