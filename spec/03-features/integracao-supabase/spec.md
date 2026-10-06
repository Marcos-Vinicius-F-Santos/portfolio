# Spec da Feature — Integração com Supabase para conteúdo e arquivos

Status: Implementada — convergência revisada; aprovação de deploy pendente  
Projeto: Portfólio Profissional — Marcos Santos  
Onde vive no código: `src/app/core/supabase/`, serviços das features de conteúdo e
administração, e `supabase/migrations/`

## 1. Objetivo

Configurar a aplicação Angular para usar o Supabase como camada de persistência e
consulta de textos, experiências, projetos, traduções, imagens e arquivos. A feature
deve entregar as migrations e as políticas de segurança necessárias para permitir
leitura pública e restringir alterações ao único administrador do portfólio.

## 2. Como funciona hoje (só se for mudança em algo que já existe)

Não se aplica como migração de comportamento existente: a aplicação não possui
armazenamento hoje. Esta feature introduz a primeira capacidade de persistência e
consulta desses conteúdos.

## 3. Requisitos funcionais

### FR-001

QUANDO a aplicação precisar armazenar ou consultar os conteúdos desta feature  
O SISTEMA DEVE utilizar uma integração configurada com o Supabase por meio da camada de
serviços da aplicação e de configurações por ambiente.

Cada ambiente deve fornecer `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (ou o nome legado
`SUPABASE_ANON_KEY`) e `SUPABASE_ADMIN_USER_ID` por arquivo `.env` local ignorado ou pelas
variáveis do provedor de deploy. Nenhum desses valores deve ser gravado em código-fonte;
o último identifica o único administrador daquele projeto Supabase.

### FR-002

QUANDO um texto for enviado para persistência  
O SISTEMA DEVE armazená-lo no Supabase e permitir sua consulta posterior.

### FR-003

QUANDO uma experiência for enviada para persistência  
O SISTEMA DEVE armazená-la no Supabase e permitir sua consulta posterior.

### FR-004

QUANDO um projeto for enviado para persistência  
O SISTEMA DEVE armazená-lo no Supabase e permitir sua consulta posterior.

### FR-005

QUANDO uma tradução for enviada para persistência  
O SISTEMA DEVE armazenar e consultar as versões em português e inglês associadas ao
conteúdo, conforme o idioma selecionado pelo switch da aplicação.

### FR-006

QUANDO uma imagem for enviada para persistência  
O SISTEMA DEVE armazená-la no Supabase Storage, manter sua referência e metadados no
banco e associá-la diretamente ao projeto correspondente.

### FR-007

QUANDO um arquivo for enviado para persistência  
O SISTEMA DEVE armazená-lo no Supabase Storage e permitir sua consulta posterior por
meio da referência persistida no banco.

### FR-008

QUANDO a estrutura necessária para os conteúdos e arquivos for criada ou alterada  
O SISTEMA DEVE aplicar a mudança por meio de uma migration versionada.

### FR-009

QUANDO os recursos desta feature forem expostos para uso pela aplicação  
O SISTEMA DEVE aplicar políticas de segurança do Supabase que permitam leitura pública
dos recursos e restrinjam inserções e atualizações ao único administrador autenticado
do portfólio.

### FR-010

QUANDO um visitante consultar o conteúdo público da aplicação  
O SISTEMA DEVE realizar a consulta por leitura (`GET`) e retornar os recursos publicados
sem exigir autenticação.

### FR-011

QUANDO uma imagem ou arquivo de exibição de projeto for enviado para o Storage  
O SISTEMA DEVE aceitar somente os formatos PNG, JPG e JPEG, com tamanho máximo de 1 MB.

## 4. Regras de negócio

### BR-001

Textos, experiências, projetos, traduções, imagens e arquivos fazem parte do escopo de
persistência e consulta desta feature.

### BR-002

As mudanças de estrutura de dados e de políticas de segurança devem ser entregues como
migrations versionadas, e não como alterações manuais sem histórico.

### BR-003

Os recursos do portfólio são públicos para leitura. Somente Marcos, autenticado pelo
Supabase Auth, pode inserir ou atualizar conteúdo e arquivos.

### BR-004

As traduções desta feature são limitadas aos switches de idioma português e inglês.

### BR-005

Imagens e arquivos de exibição de projetos aceitos devem estar nos formatos PNG, JPG ou
JPEG e ter no máximo 1 MB.

### BR-006

Um projeto pode estar associado a uma ou várias imagens por meio de uma relação direta
de cardinalidade 1:N entre projeto e imagens.

## 5. Critério de aceite

### AC-001 — caminho feliz

Dado que a aplicação esteja configurada com um Supabase disponível e que exista um item
válido de qualquer um dos tipos suportados  
Quando a aplicação armazenar o item e depois realizar sua consulta  
Então o item deve estar persistido no Supabase e ser retornado pela consulta.

### AC-002 — caminho de erro

Dado que o Supabase esteja indisponível ou que a política de segurança negue a operação  
Quando a aplicação tentar armazenar ou consultar um item  
Então a operação deve falhar de forma identificável, sem indicar sucesso indevido e sem
permitir acesso ao recurso fora da política aplicada.

### AC-003 — leitura pública

Dado que exista um recurso público persistido e que o visitante não esteja autenticado  
Quando a aplicação fizer uma consulta `GET` para o recurso  
Então o recurso deve ser retornado sem exigir autenticação.

### AC-004 — escrita restrita

Dado que um visitante não autenticado tente inserir ou atualizar um recurso  
Quando a aplicação enviar a operação ao Supabase  
Então a política de segurança deve negar a operação.

### AC-005 — idioma selecionado

Dado que exista conteúdo em português e inglês associado ao mesmo item  
Quando o visitante alternar o switch de idioma  
Então a aplicação deve consultar e apresentar a versão correspondente ao idioma
selecionado.

### AC-006 — arquivo inválido

Dado que seja enviado um arquivo de exibição de projeto com formato diferente de PNG,
JPG ou JPEG, ou maior que 1 MB  
Quando a aplicação tentar armazená-lo  
Então o arquivo deve ser rejeitado e não deve ser considerado persistido.

## 6. Casos de erro / edge cases

- Configuração ausente ou inválida do Supabase → a operação de armazenamento/consulta
  deve falhar sem ser tratada como concluída.
- Supabase indisponível ou com falha de rede → a aplicação deve reportar a falha da
  operação.
- Operação bloqueada por política de segurança → o acesso deve ser negado.
- Visitante tentando inserir ou atualizar conteúdo → a operação deve ser negada pelas
  políticas do Supabase.
- Arquivo de exibição de projeto fora dos formatos permitidos ou acima de 1 MB → o
  upload deve ser rejeitado.
- Migration necessária não aplicada → a aplicação pode falhar ao acessar o recurso; o
  estado deve ser identificável durante a verificação da feature.

## 7. Fora de escopo desta feature

- Definição das telas, formulários ou fluxos de edição dos conteúdos.
- Importação ou migração de dados existentes; foi confirmado que não há armazenamento
  hoje.
- Definição detalhada dos campos, relacionamentos e regras de validação de cada tipo de
  conteúdo, além da relação direta entre projetos e imagens definida nesta spec.
- Busca avançada, filtros, ordenação, paginação ou indexação específica.
- Cadastro de usuários ou definição de perfis e papéis adicionais; a arquitetura prevê
  somente Marcos como administrador.
- Operações de criação e atualização expostas por fluxos `POST`/`UPDATE`; nesta etapa a
  consulta da área pública fica limitada a `GET`, embora as policies já devam proteger
  as futuras escritas do administrador.
- Processamento, transformação, compressão ou geração de imagens e arquivos.
- Backup, recuperação de desastre, sincronização offline ou atualizações em tempo real.

## 8. Suposições e perguntas abertas

- [x] **Decisão:** textos, experiências, projetos e traduções serão persistidos em
  estruturas de dados do banco do Supabase.
- [x] **Decisão:** imagens e arquivos serão armazenados no Supabase Storage, com suas
  referências e metadados necessários persistidos no banco.
- [x] **Decisão:** os recursos serão públicos para leitura, mas somente Marcos poderá
  inserir ou atualizar conteúdo e arquivos.
- [x] **Decisão arquitetural:** a autenticação do administrador usará Supabase Auth com
  e-mail e senha.
- [x] **Decisão aprovada:** textos usam chaves estáveis; experiências e projetos usam UUIDs,
  traduções separadas por locale e imagens ligadas diretamente por `project_id`; os campos
  seguem a proposta do produto e estão materializados nas migrations e no plano.
- [x] **Decisão:** as traduções serão limitadas aos switches de português e inglês.
- [x] **Decisão:** imagens e arquivos de exibição de projetos aceitarão PNG, JPG e
  JPEG, com tamanho máximo de 1 MB.
- [x] **Decisão de escopo:** a consulta atual será somente por `GET`; operações `POST` e
  `UPDATE` serão criadas em features futuras.
- [x] **Decisão:** será criado um novo projeto Supabase para a aplicação.
- [x] **Decisão arquitetural:** a URL, a chave pública e o identificador do administrador
  são configurações por ambiente; forks podem apontar para projetos Supabase diferentes
  sem alterar o código versionado.
- [x] **Decisão arquitetural:** a aplicação usará Angular; a integração ficará em
  `src/app/core/supabase/`, os serviços permanecerão junto às features e as migrations
  ficarão em `supabase/migrations/`.
- [ ] **Pergunta aberta:** quais formatos e limites de tamanho serão aceitos para os
  arquivos de currículo? A regra de PNG/JPG/JPEG e 1 MB não se aplica a eles.
- [x] **Decisão:** a relação entre projetos e imagens será direta, com cardinalidade 1:N;
  um projeto poderá ter várias imagens associadas.

## 9. Definition of Done desta feature

- [ ] Critério de aceite (seção 5) satisfeito integralmente — AC-001, AC-005 e AC-006 ainda têm ressalvas de execução end-to-end documentadas no checklist.
- [x] Casos de erro de prioridade alta tratados — configuração ausente, falha de rede, escrita anon negada e constraint de imagem verificados.
- [x] Features existentes continuam funcionando (regressão checada).
- [x] Migrations e políticas de segurança revisadas e verificadas.
- [x] Testado seguindo o checklist de convergência em `spec/05-verificacao/integracao-supabase/`.
- [ ] Eu revisei e aprovei antes do deploy.
