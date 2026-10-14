# Spec da Feature — Apresentação pública de imagens de projetos

Status: Aprovada  
Projeto: Portfólio Profissional — Marcos Santos  
Onde vive no código: `src/app/features/portfolio/presentation/`, integrado aos contratos
de conteúdo em `src/app/features/portfolio/content/` e ao snapshot publicado.

## 1. Objetivo

Apresentar imagens associadas aos projetos tanto nos cards da seção de projetos da página
única quanto na página de detalhes de cada projeto. A feature deve tornar os projetos
mais visuais sem alterar o fluxo existente de upload, substituição, armazenamento ou
publicação de mídias.

## 2. Como funciona hoje

O conteúdo público é carregado a partir do snapshot publicado. O contrato
`PortfolioProject` já possui a coleção `images`, e o leitor do snapshot já transforma as
entidades `projectImage` em imagens com URL pública, ordem, nome, MIME e tamanho.

Na página única, os projetos são separados entre profissionais e pessoais. Os cards
atuais exibem nome, descrição, contexto, tecnologias e link para o detalhe, mas não
renderizam uma imagem.

Na rota `/projetos/:id`, a página de detalhes já renderiza uma galeria quando o projeto
possui imagens. Cada imagem é carregada de forma tardia, pode ser aberta em tamanho
maior e possui fallback visual quando falha. Esta feature deve preservar esse
comportamento e completar a apresentação visual da página única.

O upload e a substituição das imagens pertencem à feature
`upload-substituicao-midias`. Esta feature apenas consome as imagens que já estiverem
associadas e publicadas.

## 3. Requisitos funcionais

### FR-001 — imagem no card da página única

QUANDO um projeto público possuir pelo menos uma imagem publicada associada a ele  
O SISTEMA DEVE apresentar uma imagem representativa no card correspondente da seção de
projetos da página única.

### FR-002 — preservação da galeria de detalhes

QUANDO o visitante abrir o detalhe de um projeto com imagens publicadas  
O SISTEMA DEVE apresentar as imagens associadas ao projeto em uma galeria, preservando a
abertura individual da imagem e o comportamento de carregamento tardio já existente.

### FR-003 — texto alternativo e acessibilidade

QUANDO uma imagem for renderizada na página única ou na página de detalhes  
O SISTEMA DEVE fornecer texto alternativo derivado do projeto e do nome original da
imagem, sem depender exclusivamente da informação visual.

### FR-004 — projeto sem imagem

QUANDO um projeto não possuir imagens publicadas  
O SISTEMA DEVE manter o card ou a página de detalhes funcional, exibindo o conteúdo
textual e omitindo a área visual de imagem sem mostrar um elemento quebrado.

### FR-005 — falha de carregamento

QUANDO a URL de uma imagem publicada não puder ser carregada  
O SISTEMA DEVE ocultar ou substituir somente a imagem indisponível por um estado de
fallback, sem impedir a leitura do restante do projeto.

### FR-006 — conteúdo publicado

QUANDO o visitante acessar a página única ou o detalhe de um projeto  
O SISTEMA DEVE renderizar somente imagens que façam parte do conteúdo publicado
disponível para o leitor público.

### FR-007 — responsividade

QUANDO a apresentação for acessada em uma viewport de largura reduzida  
O SISTEMA DEVE adaptar a imagem representativa e a galeria ao layout móvel sem criar
rolagem horizontal ou sobreposição de conteúdo.

## 4. Regras de negócio

### BR-001 — associação ao projeto

Cada imagem exibida deve permanecer associada diretamente ao projeto correspondente. A
relação de um projeto para imagens continua sendo 1:N.

### BR-002 — ordenação das imagens

A ordem publicada das imagens deve ser respeitada pela galeria de detalhes. A imagem
representativa da página única deve ser a primeira imagem por `display_order`; se ela
falhar ao carregar, o sistema deve tentar as imagens seguintes na mesma ordem até
encontrar uma imagem válida.

### BR-003 — enquadramento da imagem representativa

A imagem representativa da página única deve utilizar um enquadramento visual fixo,
com dimensões de `600 × 320 px`, preservando a proporção do conteúdo dentro da área
definida e evitando distorção.

### BR-004 — imagens compartilhadas entre idiomas

As imagens pertencem ao projeto, não à tradução. A mesma associação de imagem é
compartilhada entre `pt-BR` e `en`.

### BR-005 — leitura somente do publicado

A apresentação pública não pode ler mídias inéditas, rascunhos ou referências que ainda
não tenham sido promovidas para o snapshot publicado.

### BR-006 — contrato de mídia existente

A feature deve respeitar o contrato de mídia já existente para imagens de projetos,
incluindo os formatos e limites definidos pela feature de upload e substituição de
mídias. Não deve criar novo bucket, tabela ou fluxo de upload.

## 5. Critério de aceite

### AC-001 — caminho feliz na página única

Dado que um projeto tenha uma ou mais imagens publicadas  
Quando o visitante acessar a seção de projetos da página única  
Então o card do projeto deve apresentar a primeira imagem por `display_order` em uma área
de enquadramento fixo, junto com o nome, descrição, contexto, tecnologias e link para o
detalhe.

### AC-002 — caminho feliz no detalhe

Dado que um projeto tenha várias imagens publicadas  
Quando o visitante abrir `/projetos/:id`  
Então todas as imagens devem aparecer na galeria na ordem publicada, com carregamento
tardio, texto alternativo e possibilidade de abertura individual.

### AC-003 — projeto sem imagem

Dado que um projeto não tenha imagens publicadas  
Quando o visitante visualizar o card ou o detalhe  
Então o conteúdo textual deve continuar disponível e nenhuma imagem quebrada ou galeria
vazia deve ser apresentada.

### AC-004 — imagem indisponível

Dado que uma imagem publicada falhe ao carregar  
Quando o navegador disparar o erro de carregamento  
Então a página única deve tentar a próxima imagem publicada por `display_order`, enquanto
o restante do projeto continua utilizável; na galeria de detalhes, somente a imagem
indisponível deve entrar em estado de fallback.

### AC-005 — mídia ainda não publicada

Dado que uma imagem esteja associada somente a um rascunho editorial  
Quando um visitante acessar a página pública  
Então essa imagem não deve ser renderizada até que a versão correspondente seja
publicada.

### AC-006 — layout móvel

Dado que o visitante acesse o portfólio em uma viewport móvel  
Quando a seção de projetos ou a galeria for exibida  
Então as imagens devem respeitar a largura disponível, manter proporção e não causar
rolagem horizontal.

## 6. Casos de erro / edge cases

- Projeto com imagem inválida no snapshot → ignorar a referência inválida e manter as
  demais imagens válidas.
- Projeto com várias imagens e uma delas indisponível → a página única tenta a próxima
  imagem válida por `display_order`; a galeria exibe as demais imagens válidas e sinaliza
  somente a imagem que falhou.
- Projeto sem nome de arquivo original → usar um texto alternativo seguro baseado no
  nome do projeto e no identificador da imagem.
- Imagem muito grande ou com proporção incomum → manter o limite de tamanho visual do
  card/galeria sem distorcer o conteúdo.
- Falha de leitura do snapshot → preservar o tratamento de erro existente e não
  informar que uma mídia foi publicada quando isso não puder ser confirmado.

## 7. Fora de escopo desta feature

- Upload, substituição ou remoção de imagens.
- Alterações em Storage, tabelas, policies, grants ou funções do Supabase.
- Imagens diferentes para `pt-BR` e `en`.
- Corte, compressão, redimensionamento, conversão ou processamento de arquivos.
- Carrossel, zoom avançado, lightbox ou ordenação manual na interface pública.
- Alteração da estrutura textual ou da navegação dos projetos.
- Publicação de rascunhos ou alteração do fluxo editorial.

## 8. Suposições e perguntas abertas

- [x] A imagem representativa da página única é sempre a primeira imagem por
  `display_order`.
- [x] Se a primeira imagem falhar, o card tenta a próxima imagem publicada na ordem.
- [x] A capa do card usa enquadramento fixo de `600 × 320 px`, preservando a proporção
  da imagem e sem distorção.
- [x] **Suposição de escopo:** a galeria da tela de detalhes já existente deve ser
  preservada, recebendo apenas os ajustes necessários para cumprir acessibilidade,
  responsividade e tratamento de erro.
- [x] **Suposição de arquitetura:** a feature deve usar o snapshot publicado e os
  contratos de mídia existentes, sem criar uma nova fonte de dados.

## 9. Definition of Done desta feature

- [x] As perguntas abertas da seção 8 foram respondidas e incorporadas à spec.
- [ ] A imagem representativa aparece nos cards com conteúdo publicado.
- [ ] A galeria de detalhes continua funcionando para uma ou várias imagens.
- [ ] Projetos sem imagens e imagens indisponíveis possuem fallback testado.
- [ ] Texto alternativo e comportamento responsivo foram verificados.
- [ ] O conteúdo não publicado não aparece na página pública.
- [ ] Upload, substituição, publicação e autenticação existentes continuam funcionando
      (regressão checada).
- [ ] Testes unitários e de apresentação foram executados conforme o plano de verificação.
- [ ] Eu revisei e aprovei antes do deploy.
