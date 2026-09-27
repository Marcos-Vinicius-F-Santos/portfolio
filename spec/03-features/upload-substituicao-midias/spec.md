# Spec da Feature — Upload e substituição de imagens e currículos

> **Reconciliação editorial — 2026-09-26:** Mídias inéditas ficam privadas; novas associações só entram no publicado após promoção. Remoção imediata de arquivo anterior cede à retenção/GC para permitir restauração. A [spec de edição visual](../edicao-visual-rascunho-publicacao/spec.md) prevalece nesses pontos quando implantada. Os requisitos anteriores continuam referência para o comportamento não alterado e a regressão; esta nota não comprova implementação ou testes.

Status: Aprovada  
Projeto: Portfólio Profissional — Marcos Santos  
Onde vive no código: `src/app/features/admin/media-management/`, integrado aos serviços
de conteúdo em `src/app/features/portfolio/content/`, à autenticação administrativa e às
migrations/policies em `supabase/`, conforme `spec/02-arquitetura/ARQUITETURA.md`.

## 1. Objetivo

Permitir que o administrador faça o upload e a substituição das imagens associadas aos
projetos e dos currículos em português brasileiro e inglês. Os arquivos devem ser
armazenados no Supabase Storage e permanecer associados aos respectivos conteúdos para
que a página pública utilize a versão atualmente persistida.

## 2. Como funciona hoje

Atualmente não existe procedimento, tela ou serviço administrativo para fazer upload ou
substituir imagens de projetos ou arquivos de currículo.

A página pública já consegue ler referências de imagens de projetos e de currículos que
tenham sido persistidas no Supabase, mas essas referências precisam existir previamente.
A feature de gestão de conteúdo administrativo existente também não inclui upload ou
gerenciamento de mídia.

Esta feature introduz o fluxo administrativo de upload e substituição, preservando a
leitura pública existente.

## 3. Requisitos funcionais

### FR-001

QUANDO o administrador autenticado selecionar uma imagem para um projeto existente  
O SISTEMA DEVE permitir o upload da imagem para armazenamento persistente.

### FR-002

QUANDO o administrador autenticado selecionar um currículo em português brasileiro ou em
inglês  
O SISTEMA DEVE permitir o upload do currículo correspondente ao idioma selecionado.

### FR-003

QUANDO uma imagem de projeto ou um currículo for enviado com sucesso  
O SISTEMA DEVE armazenar o arquivo no Supabase Storage.

### FR-004

QUANDO um arquivo for armazenado com sucesso  
O SISTEMA DEVE persistir sua referência e seus metadados associados ao respectivo
conteúdo: projeto, no caso de uma imagem, ou idioma do currículo, no caso de um
currículo.

### FR-005

QUANDO já existir uma imagem associada a um projeto e o administrador autenticado
selecionar o registro específico dessa imagem para substituição  
O SISTEMA DEVE permitir o envio de uma nova imagem e atualizar a associação do projeto
para a imagem substituta após a persistência bem-sucedida, removendo o objeto anterior
do Supabase Storage.

### FR-006

QUANDO já existir um currículo associado a `pt-BR` ou `en` e o administrador autenticado
solicitar sua substituição  
O SISTEMA DEVE permitir o envio de um novo currículo e atualizar a associação do idioma
para o currículo substituto após a persistência bem-sucedida.

### FR-007

QUANDO um upload ou uma substituição for concluído com sucesso  
O SISTEMA DEVE disponibilizar a nova associação para a leitura pública correspondente,
sem exigir alteração no layout público.

### FR-008

QUANDO o upload do arquivo ou a persistência da associação falhar  
O SISTEMA DEVE indicar a falha e NÃO DEVE informar que o novo arquivo foi associado com
sucesso.

## 4. Regras de negócio

### BR-001 — acesso administrativo

O upload e a substituição devem ocorrer somente pela área administrativa autenticada e
autorizada para Marcos, seguindo as regras de autenticação e RLS já aprovadas.

### BR-002 — armazenamento

Imagens de projetos e currículos devem ser armazenados no Supabase Storage. As tabelas
do PostgreSQL devem manter as referências e os metadados necessários, sem armazenar o
binário dos arquivos dentro das tabelas de conteúdo.

### BR-003 — associação de imagens

As imagens devem permanecer associadas diretamente ao projeto correspondente. A relação
de projeto para imagens segue a cardinalidade 1:N já definida na arquitetura.

### BR-004 — currículos por idioma

Deve existir no máximo um currículo corrente para cada locale suportado: `pt-BR` e `en`.
A substituição deve manter o currículo associado ao mesmo locale.

### BR-005 — formatos de imagem

As imagens de projetos devem respeitar o contrato já aprovado para arquivos de exibição:
PNG, JPG ou JPEG, com tamanho máximo de 1 MB.

### BR-006 — formato de currículo

Os currículos devem respeitar o contrato aprovado de PDF e utilizar o MIME
`application/pdf`.

### BR-007 — publicação

Uma associação só deve ser considerada atualizada quando o arquivo e a referência
correspondente tiverem sido persistidos com sucesso. A alteração aprovada fica
disponível para leitura pública conforme a regra de publicação imediata do produto.

### BR-008 — segurança da leitura pública

Visitantes podem ler os arquivos públicos associados, mas não podem fazer upload,
substituir arquivos ou alterar referências.

### BR-009 — substituição de imagem específica

Quando um projeto possuir várias imagens, a substituição deve identificar e atualizar
uma imagem específica, sem substituir a galeria inteira do projeto.

### BR-010 — imagens compartilhadas entre idiomas

As imagens são associadas ao projeto e são compartilhadas entre as versões em português
e inglês. Não haverá uma imagem diferente por tradução do projeto.

### BR-011 — remoção do arquivo anterior

Após uma substituição confirmada, o objeto anterior deve ser removido do Supabase
Storage. Em caso de falha antes da associação ser persistida, um objeto enviado sem
referência deve ser removido automaticamente.

### BR-012 — substituições concorrentes

Quando houver substituições concorrentes para a mesma imagem ou currículo, a última
operação confirmada deve prevalecer.

## 5. Critério de aceite

### AC-001 — caminho feliz: upload de imagem de projeto

Dado que Marcos esteja autenticado, que exista um projeto e que a imagem selecionada
seja válida  
Quando ele fizer o upload da imagem para o projeto  
Então o arquivo deve ser armazenado no Supabase Storage, sua referência e seus
metadados devem ser associados ao projeto, e a imagem deve ficar disponível para a
leitura pública correspondente.

### AC-002 — caminho feliz: upload dos currículos por idioma

Dado que Marcos esteja autenticado e selecione um currículo PDF para `pt-BR` ou `en`  
Quando ele fizer o upload do currículo para o idioma selecionado  
Então o arquivo deve ser armazenado no Supabase Storage, sua referência deve ser
associada ao locale correspondente e a página pública deve conseguir utilizar o
currículo associado àquele idioma.

### AC-003 — caminho feliz: substituição

Dado que exista uma imagem de projeto ou um currículo já associado  
Quando Marcos enviar um novo arquivo válido para substituí-lo  
Então a nova referência deve tornar-se a associação corrente da imagem específica, do
mesmo projeto ou do mesmo locale, a leitura pública deve utilizar o novo arquivo e o
objeto anterior deve ser removido do Supabase Storage.

### AC-004 — caminho de erro: arquivo inválido

Dado que Marcos selecione uma imagem fora dos formatos permitidos, uma imagem maior que
1 MB ou um currículo que não seja PDF  
Quando ele tentar fazer o upload ou a substituição  
Então o sistema deve rejeitar o arquivo, indicar a falha e não deve criar uma nova
associação considerada válida.

### AC-005 — caminho de erro: falha de Storage ou persistência

Dado que Marcos tente fazer um upload ou uma substituição e o Supabase Storage ou a
persistência da referência esteja indisponível ou recuse a operação  
Quando a operação for executada  
Então o sistema deve indicar a falha e não deve informar que o novo arquivo foi
associado ou publicado com sucesso.

### AC-006 — escrita não autorizada

Dado que um visitante não autenticado tente fazer upload ou substituir uma imagem ou um
currículo  
Quando enviar a operação ao Supabase  
Então a operação deve ser negada pelas políticas de segurança e nenhum novo arquivo ou
associação deve ser considerado publicado.

## 6. Casos de erro / edge cases

- Projeto inexistente ou não carregado → o upload da imagem não deve prosseguir nem criar
  uma associação sem projeto válido.
- Locale diferente de `pt-BR` ou `en` → o upload do currículo deve ser rejeitado.
- Imagem PNG, JPG ou JPEG acima de 1 MB → o upload deve ser rejeitado pelo contrato de
  armazenamento.
- Currículo com MIME diferente de `application/pdf` → o upload deve ser rejeitado pelo
  contrato do banco e do bucket.
- Supabase indisponível ou configuração inválida → a operação deve falhar de forma
  identificável e não deve ser apresentada como concluída.
- Visitante tentando escrever diretamente no Storage ou nas tabelas → a policy deve
  negar a operação.
- Falha depois do envio do arquivo, mas antes da persistência da associação → o sistema
  não deve apresentar a nova associação como publicada e deve remover automaticamente o
  objeto órfão.
- Substituição simultânea do mesmo arquivo por operações administrativas concorrentes →
  a última substituição confirmada deve prevalecer.

## 7. Fora de escopo desta feature

- Exclusão manual avulsa de imagens, currículos, referências ou objetos do Storage.
- Corte, compressão, redimensionamento, conversão ou processamento dos arquivos.
- Alteração do layout, da navegação ou da apresentação pública dos projetos e currículos.
- Criação de novos idiomas além de `pt-BR` e `en`.
- Upload por visitantes ou por qualquer administrador diferente de Marcos.
- Workflow de rascunho, revisão, aprovação ou publicação posterior.
- Migração automática de arquivos que estejam fora do Supabase Storage.
- Gestão de habilidades, formação, contatos ou outros conteúdos que não sejam as imagens
  de projetos e os currículos descritos nesta feature.
- Sincronização com LinkedIn, GitHub, e-mail ou outros serviços externos.

## 8. Suposições e perguntas abertas

- [x] **Comportamento atual confirmado por Marcos:** não existe procedimento para fazer
      upload ou substituir imagens de projetos e currículos.
- [x] **Decisão arquitetural reutilizada:** a área administrativa protegida e o único
      administrador autorizado já são definidos pelas features de autenticação e pela
      arquitetura; esta feature não cria outro mecanismo de autorização.
- [x] **Decisão arquitetural reutilizada:** imagens usam o bucket lógico de imagens de
      projetos e currículos usam o bucket lógico de currículos, com referências no
      PostgreSQL.
- [x] **Decisão já aprovada:** imagens de projetos são relacionadas diretamente ao
      projeto, com cardinalidade 1:N.
- [x] **Decisão já aprovada:** currículos são PDFs, com um registro corrente por locale
      suportado (`pt-BR` e `en`).
- [x] **Suposição operacional:** “upload” significa adicionar uma nova imagem ao projeto
      ou criar o currículo do locale quando ainda não houver associação.
- [x] **Suposição operacional:** “substituição” significa tornar o novo arquivo a
      associação corrente para o mesmo projeto ou locale.
- [x] **Decisão confirmada por Marcos:** ao substituir um arquivo, o objeto anterior
      deve ser removido do Supabase Storage.
- [x] **Decisão confirmada por Marcos:** quando um projeto possuir várias imagens, a
      substituição deve selecionar uma imagem específica, identificada por seu registro.
- [x] **Decisão confirmada por Marcos:** as imagens de um projeto são compartilhadas
      entre português e inglês; não haverá imagens diferentes por tradução.
- [x] **Decisão confirmada por Marcos:** se o upload no Storage for concluído, mas a
      referência não puder ser persistida, o objeto órfão deve ser removido
      automaticamente.
- [x] **Decisão confirmada por Marcos:** em substituições concorrentes, a última operação
      confirmada deve prevalecer.

## 9. Definition of Done desta feature

- [ ] Critérios de aceite da seção 5 satisfeitos.
- [ ] Upload de imagem de projeto e upload de currículo por locale validados.
- [ ] Substituição de imagem e de currículo validada sem quebrar a associação pública.
- [ ] Arquivos inválidos, falhas de Storage/persistência e escrita não autorizada tratados.
- [ ] As decisões confirmadas por Marcos sobre substituição, compartilhamento entre
      idiomas, limpeza de objetos e concorrência foram refletidas no código e nos testes.
- [ ] Features existentes continuam funcionando, com regressão checada.
- [ ] Alterações de schema, grants, RLS ou Storage foram entregues por migrations
      versionadas com caminho de volta definido.
- [ ] Testado seguindo o plano de verificação criado a partir desta Spec.
- [ ] Marcos revisou e aprovou antes de qualquer deploy.
