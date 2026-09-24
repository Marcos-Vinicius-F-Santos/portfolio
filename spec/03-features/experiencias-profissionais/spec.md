# Spec da Feature — Experiências profissionais

Status: Aprovada  
Projeto: Portfólio Profissional — Marcos Santos  
Onde vive no código: `src/app/features/portfolio/presentation/` (seção de experiências da página pública)

## 1. Objetivo

Substituir o texto simples atualmente mockado na seção de experiências por uma
apresentação cronológica e estruturada das experiências profissionais. Cada experiência
deve comunicar o período, o nome da empresa, o cargo, o contexto, as responsabilidades,
as decisões técnicas e os resultados.

## 2. Como funciona hoje (só se for mudança em algo que já existe)

A seção de experiências já existe na página pública, mas está apenas mockada com texto
simples. Ela ainda não apresenta experiências em uma estrutura própria nem exibe os
campos profissionais definidos nesta feature.

## 3. Requisitos funcionais

### FR-001

QUANDO o visitante acessar a página pública do portfólio  
O SISTEMA DEVE apresentar as experiências profissionais em ordem cronológica, da mais
recente para a mais antiga.

### FR-002

QUANDO uma experiência profissional for apresentada  
O SISTEMA DEVE exibir o período correspondente à experiência no formato `MM/YYYY` para
o início e `MM/YYYY` para o fim.

### FR-003

QUANDO uma experiência profissional for apresentada  
O SISTEMA DEVE exibir o cargo exercido.

### FR-004

QUANDO uma experiência profissional for apresentada  
O SISTEMA DEVE exibir o contexto da atuação profissional.

### FR-005

QUANDO uma experiência profissional for apresentada  
O SISTEMA DEVE exibir as responsabilidades associadas à atuação.

### FR-006

QUANDO uma experiência profissional for apresentada  
O SISTEMA DEVE exibir as decisões técnicas relacionadas à atuação.

### FR-007

QUANDO uma experiência profissional for apresentada  
O SISTEMA DEVE exibir os resultados alcançados na atuação.

### FR-008

QUANDO uma experiência profissional for apresentada  
O SISTEMA DEVE exibir o nome da empresa correspondente e o cargo exercido.

## 4. Regras de negócio

### BR-001

O nome da empresa e o cargo podem ser publicados como parte da experiência profissional,
desde que façam parte do conteúdo aprovado por Marcos.

### BR-002

Cada experiência publicada deve ser apresentada como uma unidade que reúne período,
cargo, contexto, responsabilidades, decisões técnicas e resultados.

### BR-003

A apresentação das experiências deve permanecer na página pública única do portfólio;
esta feature não cria uma nova página pública.

### BR-004

Todas as experiências consideradas para publicação devem possuir período, cargo,
contexto, responsabilidades, decisões técnicas e resultados.

### BR-005

Quando experiências tiverem a mesma posição cronológica, períodos incompletos ou
períodos sobrepostos, o sistema deve usar a ordem de inclusão como critério de desempate.

### BR-006

Quando não houver experiências disponíveis, a seção de experiências não deve ser exibida.

## 5. Critério de aceite

### AC-001 — caminho feliz

Dado que existam experiências profissionais disponíveis para apresentação  
Quando o visitante acessar a página pública do portfólio  
Então o sistema deve substituir o texto simples mockado por uma apresentação das
experiências da mais recente para a mais antiga, exibindo para cada experiência o período
no formato `MM/YYYY` para início e fim, o cargo, o contexto, as responsabilidades, as
decisões técnicas e os resultados.

### AC-002 — caminho feliz: empresa e cargo

Dado que os dados de uma experiência contenham o nome da empresa e o cargo aprovados
para publicação  
Quando a experiência for apresentada na página pública  
Então o sistema deve renderizar o nome da empresa e o cargo junto aos demais campos da
experiência.

### AC-003 — caminho de erro: ausência de experiências

Dado que não existam experiências profissionais disponíveis para apresentação  
Quando o visitante acessar a página pública do portfólio  
Então o sistema não deve exibir a seção de experiências.

## 6. Casos de erro / edge cases

- Todas as experiências devem possuir os campos obrigatórios antes de serem consideradas
  para publicação.
- Nenhuma experiência disponível: a seção não deve ser exibida.
- Experiências com períodos iguais, incompletos ou sobrepostos: usar a ordem de inclusão
  como critério de desempate.

## 7. Fora de escopo desta feature

- Cadastro, edição ou exclusão de experiências pela área administrativa.
- Alterações de schema, migrations ou políticas RLS além da migration aprovada para renomear `company_context` para `name`.
- Inclusão de informações confidenciais de empresas, clientes ou sistemas internos.
- Criação de uma nova página pública ou alteração do fluxo de página única.
- Alteração das seções de resultados profissionais, projetos, habilidades, formação ou
  contato.
- Definição de novos conteúdos profissionais além dos campos descritos nesta feature.

## 8. Suposições e perguntas abertas

- [x] Suposição: esta feature substitui o texto simples atualmente mockado na seção
      `experiencias`.
- [x] Suposição: a apresentação pertence à página pública e vive no domínio de
      apresentação definido pela arquitetura.
- [x] Decisão: a ordem cronológica deve exibir a experiência mais recente primeiro e a
      mais antiga por último.
- [x] Decisão: o período deve usar `MM/YYYY` para o início e `MM/YYYY` para o fim.
- [x] Decisão: todas as experiências terão período, cargo, contexto, responsabilidades,
      decisões técnicas e resultados.
- [x] Decisão: quando não houver experiências disponíveis, a seção não deve ser exibida.
- [x] Decisão: períodos iguais, incompletos ou sobrepostos devem usar a ordem de inclusão
      como critério de desempate.
- [x] Decisão: o nome da empresa e o cargo podem ser exibidos na experiência, desde que
      estejam no conteúdo aprovado para publicação e não sejam acompanhados de
      informações confidenciais.

## 9. Definition of Done desta feature

- [ ] Critério de aceite (seção 5) satisfeito.
- [ ] Casos de erro de prioridade alta tratados ou explicitamente resolvidos nas
      perguntas abertas.
- [ ] A ordem cronológica e os campos apresentados foram revisados e aprovados por
      Marcos.
- [ ] Features existentes continuam funcionando (regressão checada).
- [ ] Testado seguindo `specs/05-verificacao/plano-de-teste-template.md`.
- [ ] Eu revisei e aprovei antes do deploy.
