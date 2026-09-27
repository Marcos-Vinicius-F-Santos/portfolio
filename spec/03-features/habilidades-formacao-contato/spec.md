# Spec da Feature — Habilidades, formação acadêmica e contato

> **Reconciliação editorial — 2026-09-26:** Skills/formação/contatos entram no rascunho. Ícones personalizados explicitamente escolhidos precedem catálogo padrão. PDF por idioma é opcional, sem download substituto enganoso. A [spec de edição visual](../edicao-visual-rascunho-publicacao/spec.md) prevalece nesses pontos quando implantada. Os requisitos anteriores continuam referência para o comportamento não alterado e a regressão; esta nota não comprova implementação ou testes.

Status: Rascunho  
Projeto: Portfólio Profissional — Marcos Santos  
Onde vive no código: `src/app/features/portfolio/presentation/`, com leitura de conteúdo em `src/app/features/portfolio/content/`, conforme a arquitetura.

## 1. Objetivo

Completar a seção pública de habilidades técnicas, apresentar a formação acadêmica e
disponibilizar uma seção própria de contato no final da página única. A seção de contato
deve reunir símbolos funcionais para LinkedIn, GitHub, e-mail, telefone e currículos,
facilitando o acesso do visitante aos canais profissionais de Marcos.

## 2. Como funciona hoje

A página pública já prevê uma seção de “Stack técnica”, mas ela ainda não existe
completamente e não possui um comportamento consolidado. Nesta feature, essa seção será
apresentada publicamente com o nome “Habilidades”, mantendo sua finalidade de exibir a
stack técnica.

As seções de formação acadêmica e contato ainda não estão completamente disponíveis na
página pública. Não há, portanto, um comportamento existente dessas duas seções a
preservar.

## 3. Requisitos funcionais

### FR-001

QUANDO o visitante acessar a página pública  
O SISTEMA DEVE apresentar uma seção chamada “Habilidades” para exibir a stack técnica.

### FR-002

QUANDO a seção “Habilidades” for exibida  
O SISTEMA DEVE apresentar as habilidades técnicas como nomes individualmente legíveis,
como no exemplo “Java, Node.js, JavaScript”.

### FR-003

QUANDO a seção “Habilidades” for exibida  
O SISTEMA DEVE organizar as habilidades nas categorias técnicas definidas para o
portfólio, utilizando por enquanto o catálogo atual:

- linguagens e runtime: Java, JavaScript, TypeScript, Node.js e ABAP;
- sistemas corporativos e integrações: SAP, RFC, BAPI, JCo, REST APIs, SMTP, Mendix e
  OutSystems;
- frontend: React, HTML e CSS;
- DevOps e observabilidade: Docker, Gradle, Maven e Grafana;
- bancos de dados: SQL Server, MySQL, PostgreSQL e MongoDB;
- versionamento: Git, GitHub e GitLab.

### FR-004

QUANDO o visitante acessar a página pública  
O SISTEMA DEVE apresentar uma seção de formação acadêmica contendo as pós-graduações em
Ciência de Dados e Estatística Aplicada realizadas na Unopar Anhanguera.

### FR-005

QUANDO o visitante acessar a página pública  
O SISTEMA DEVE apresentar uma seção própria de contato posicionada no final da página
única.

### FR-006

QUANDO a seção de contato for exibida  
O SISTEMA DEVE disponibilizar os símbolos oficiais públicos de LinkedIn, GitHub, e-mail
e telefone, com a label correspondente apresentada abaixo de cada símbolo.

### FR-007

QUANDO o visitante acionar o símbolo de LinkedIn, GitHub, e-mail ou telefone  
O SISTEMA DEVE direcioná-lo ao destino correspondente ao canal acionado.

### FR-008

QUANDO a seção de contato for exibida  
O SISTEMA DEVE disponibilizar o acesso aos currículos em português e inglês.

### FR-009

QUANDO o visitante selecionar o idioma do portfólio e acionar o acesso ao currículo  
O SISTEMA DEVE disponibilizar o arquivo correspondente ao idioma selecionado para
download, conforme a regra de seleção de idioma existente.

## 4. Regras de negócio

### BR-001 — Nome público da stack

A stack técnica será apresentada ao visitante na seção chamada “Habilidades”.

### BR-002 — Ordem das seções

A página deve apresentar as seções na sequência de conteúdo definida para esta feature:
Habilidades, formação acadêmica e contato. A seção de contato deve permanecer como a
última dessas seções.

### BR-003 — Canais de contato

Cada símbolo da seção de contato deve representar um único canal: LinkedIn, GitHub,
e-mail, telefone ou currículo. Os símbolos de LinkedIn, GitHub, e-mail e telefone devem
ser os símbolos oficiais públicos de seus respectivos canais, e cada símbolo deve ter sua
label apresentada abaixo.

Os destinos confirmados são:

- LinkedIn: `https://www.linkedin.com/in/marcos-santos-b9b544214/`;
- GitHub: `https://github.com/Marcos-Vinicius-F-Santos`;
- e-mail: `marcossantosjdev@gmail.com`;
- telefone: `+55 37 998292763`.

### BR-004 — Currículo por idioma

O currículo disponibilizado deve corresponder ao idioma atualmente selecionado no
portfólio: português ou inglês.

Devem existir exatamente dois arquivos de currículo: um PDF em português brasileiro e
um PDF em inglês. Os arquivos serão enviados posteriormente por upload e poderão ser
substituídos quando Marcos atualizar os currículos, sem exigir alteração do layout
público.

### BR-005 — Limite da integração externa

LinkedIn, GitHub, e-mail e telefone são destinos de contato. Esta feature não inclui
sincronização ou escrita de dados nesses serviços externos.

## 5. Critério de aceite

### AC-001 — caminho feliz: apresentação das seções

Dado que o visitante tenha carregado a página pública  
Quando visualizar as seções de conteúdo  
Então deve encontrar a seção “Habilidades”, a seção de formação acadêmica com as
pós-graduações informadas e a seção de contato ao final da página.

### AC-002 — caminho feliz: habilidades técnicas

Dado que a seção “Habilidades” esteja disponível  
Quando o visitante a visualizar  
Então deve conseguir ler as habilidades técnicas como nomes individuais, organizadas
nas categorias técnicas definidas para o portfólio.

### AC-003 — caminho feliz: canais de contato

Dado que o visitante esteja na seção de contato  
Quando acionar o símbolo de LinkedIn, GitHub, e-mail ou telefone  
Então deve ser direcionado ao canal correspondente ao símbolo acionado e identificar o
canal pela label apresentada abaixo do símbolo.

### AC-004 — caminho feliz: currículo no idioma selecionado

Dado que o visitante esteja com o portfólio em português ou inglês  
Quando acionar o acesso ao currículo  
Então deve ser disponibilizado para download o currículo correspondente ao idioma
selecionado.

### AC-005 — caminho de erro: destino indisponível

Dado que um destino de contato ou arquivo de currículo esteja ausente ou indisponível  
Quando o visitante acionar o símbolo correspondente  
Então o sistema não deve indicar que o acesso ou download foi concluído com sucesso e a
página deve permanecer aberta e utilizável.

## 6. Casos de erro / edge cases

- Destino de LinkedIn, GitHub, e-mail ou telefone ausente ou inválido → o símbolo não
  deve produzir uma indicação falsa de sucesso; a página deve continuar utilizável.
- Arquivo do currículo correspondente ao idioma selecionado indisponível → o download
  não deve ser tratado como concluído.
- Conteúdo da seção de habilidades maior que o espaço disponível → os nomes devem
  continuar legíveis sem sobreposição ou corte, respeitando o layout vertical existente.
- Tradução ausente para um item de conteúdo → aplicar o fallback de conteúdo definido
  pela feature de alternância de idioma.

## 7. Fora de escopo desta feature

- Alteração da navegação geral ou da regra de página única do portfólio.
- Redefinição do layout vertical já definido para as seções.
- Criação de novos idiomas além de português brasileiro e inglês.
- Sincronização automática com LinkedIn, GitHub, provedores de e-mail ou telefonia.
- Formulário persistente de contato ou caixa de mensagens.
- Criação da área administrativa para cadastrar ou editar habilidades, formação,
  contatos ou currículos.
- Definição dos buckets, migrations e políticas de armazenamento dos arquivos; esses
  detalhes pertencem à integração e à arquitetura do Supabase.
- Refinamento visual definitivo, escolha de biblioteca de ícones ou definição de
  identidade visual além da apresentação dos símbolos solicitados.

## 8. Suposições e perguntas abertas

- [x] Suposição confirmada por Marcos: a seção existente é a “Stack técnica”, ainda
      incompleta, e seu nome público deve ser “Habilidades”.
- [x] Suposição confirmada por Marcos: as habilidades serão apresentadas como nomes
      legíveis, por exemplo “Java, Node.js, JavaScript”.
- [x] Decisão confirmada por Marcos: os links ficarão reunidos em uma seção própria de
      contato no final da página.
- [x] Decisão confirmada pelo produto: a formação exibirá as pós-graduações em Ciência
      de Dados e Estatística Aplicada da Unopar Anhanguera.
- [x] Decisão confirmada pelo produto: o currículo deve acompanhar o idioma selecionado
      entre português brasileiro e inglês.
- [x] Decisão confirmada por Marcos: serão usados símbolos oficiais públicos para os
      canais de contato, com a label correspondente abaixo de cada símbolo.
- [x] Decisão confirmada por Marcos: os destinos são LinkedIn em
      `https://www.linkedin.com/in/marcos-santos-b9b544214/`, GitHub em
      `https://github.com/Marcos-Vinicius-F-Santos`, e-mail em
      `marcossantosjdev@gmail.com` e telefone em `+55 37 998292763`.
- [x] Decisão confirmada por Marcos: os arquivos ou URLs dos currículos serão definidos
      posteriormente por upload e poderão ser atualizados quando necessário. Serão
      sempre exatamente dois arquivos PDF: um em português brasileiro e outro em inglês.
- [x] Decisão confirmada por Marcos: a lista atual de categorias e tecnologias da Spec
      do Produto será utilizada por enquanto.
- [x] Suposição necessária para tornar “símbolos funcionais” observável: cada símbolo
      será acionável e terá um destino correspondente ao canal representado.
- [x] Suposição necessária para o caminho de erro: um símbolo sem destino válido ou um
      currículo indisponível não deve ser tratado como acesso ou download concluído, e a
      página deve permanecer utilizável.

## 9. Definition of Done desta feature

- [ ] Critérios de aceite da seção 5 satisfeitos.
- [ ] As seções “Habilidades”, formação acadêmica e contato estão apresentadas na página
      pública, com contato ao final.
- [ ] Os símbolos de contato e os acessos aos currículos foram verificados nos dois
      idiomas.
- [ ] Casos de erro de prioridade alta tratados.
- [ ] Features existentes continuam funcionando — regressão checada.
- [ ] Testado seguindo o plano de verificação definido a partir desta Spec.
- [ ] Marcos revisou e aprovou antes do deploy.
