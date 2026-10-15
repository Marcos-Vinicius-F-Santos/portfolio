# Spec da Feature — Refatoração White-Label e Isolamento por Perfil

Status: Aprovada  
Projeto: Portfólio Profissional  
Onde vive no código: `src/app/features/portfolio`, `src/app/core/config`, `scripts`, `supabase` e arquivos de especificação editorial

## 1. Objetivo

Remover do código compartilhado, dos nomes de arquivos operacionais e dos fallbacks
qualquer identificação específica de uma pessoa, como nome, links pessoais, imagem ou
monograma. Os dados de cada perfil devem ser carregados por configuração de ambiente
e/ou conteúdo publicado no Supabase, reduzindo o risco de vazamento de dados entre
instâncias e diminuindo a superfície de conflitos durante merges entre forks.

Esta feature entra agora porque o repositório ainda possui artefatos nomeados para
João Vitor e referências pessoais hardcoded, enquanto a mesma base também é utilizada
para o portfólio de Marcos.

## 2. Como funciona hoje

- O fallback de `src/app/features/portfolio/services/portfolio-content.ts` ainda
  contém links pessoais associados ao fork de João Vitor.
- O hero utiliza uma imagem local nomeada por pessoa (`marcos-santos.jpg`), e o
  repositório também mantém `src/assets/profile/joao-vitor.jpg`.
- Existem scripts, migrations/SQL, snapshots e diretórios de spec com nomes de João
  Vitor, incluindo `generate-joao-editorial-snapshot.mjs`,
  `setup_editorial_joao_vitor.sql` e snapshots editoriais nomeados.
- O gerador de configuração já lê variáveis de ambiente e a aplicação já consegue
  carregar conteúdo autoral pelo Supabase, mas a base ainda possui fallbacks e
  artefatos específicos que podem ser levados para outro fork por um merge.
- No projeto local validado, o conteúdo efetivamente exibido é o de Marcos carregado
  pelo Supabase e o hero usa a foto de Marcos. Isso não elimina as referências pessoais
  presentes no código e nos artefatos versionados.

## 3. Requisitos funcionais

### FR-001 — Código compartilhado sem identidade pessoal

QUANDO o código TypeScript, HTML, CSS, configuração pública ou asset empacotado for
utilizado por qualquer instância do portfólio  
O SISTEMA DEVE evitar nomes próprios, biografias, métricas, telefones, e-mails, URLs
de redes sociais e imagens identificadas por pessoa.

### FR-002 — Fallback neutro

QUANDO o conteúdo do perfil não estiver disponível ou o Supabase não responder  
O SISTEMA DEVE exibir somente conteúdo neutro e não deve exibir dados de João Vitor,
Marcos Santos ou de qualquer outro perfil.

### FR-003 — Identidade fornecida por configuração ou conteúdo publicado

QUANDO uma instância iniciar  
O SISTEMA DEVE obter nome, monograma, imagem de perfil, contatos e demais dados autorais
por configuração de ambiente e/ou snapshot publicado do perfil correspondente.

### FR-004 — Imagem de perfil desacoplada do nome do arquivo

QUANDO o hero precisar exibir a imagem do perfil  
O SISTEMA DEVE consumir uma referência genérica ou uma URL de mídia do perfil, sem
depender de um arquivo versionado com o nome de uma pessoa.

### FR-005 — Scripts e arquivos operacionais genéricos

QUANDO um script gerar snapshot editorial, seed ou SQL de configuração  
O SISTEMA DEVE utilizar nomes funcionais e genéricos, sem o nome de um autor no nome
do arquivo, no caminho de saída ou na lógica compartilhada.

### FR-006 — Conteúdo de seed parametrizável

QUANDO um snapshot ou seed for gerado para uma instância  
O SISTEMA DEVE receber o conteúdo específico por entrada parametrizada, configuração
de ambiente ou fonte de dados definida para o perfil, em vez de manter uma cópia pessoal
fixa dentro do script genérico.

### FR-007 — Dados de contato sem fallback pessoal

QUANDO o painel de contato resolver os destinos de WhatsApp, e-mail, LinkedIn ou GitHub  
O SISTEMA DEVE utilizar os contatos do perfil carregado e, na ausência deles, manter os
destinos vazios ou neutros, sem reutilizar contatos de outro perfil.

### FR-008 — Migração sem referências quebradas

QUANDO os arquivos específicos forem renomeados ou movidos para nomes genéricos  
O SISTEMA DEVE atualizar imports, scripts, referências de documentação operacional,
testes e comandos de build relacionados, sem depender dos nomes antigos.

### FR-009 — Isolamento entre instâncias

QUANDO duas instâncias do portfólio forem executadas com configurações ou fontes de
conteúdo diferentes  
O SISTEMA DEVE renderizar somente os dados da instância ativa e não deve usar dados
residuais de outro perfil como fallback.

### FR-010 — Compatibilidade com a experiência pública existente

QUANDO a refatoração for concluída  
O SISTEMA DEVE preservar a estrutura, o layout, a navegação, a troca de idioma, os
projetos, as imagens de projetos, o painel de contato e o acesso administrativo já
existentes, exceto pela origem dos dados pessoais.

## 4. Regras de negócio

### BR-001 — Dados pessoais pertencem ao perfil

Dados autorais só podem ser exibidos quando forem resolvidos pela configuração ou pelo
conteúdo publicado da instância ativa.

### BR-002 — Nomes pessoais não identificam artefatos compartilhados

Scripts, assets padrão, snapshots genéricos, migrations, nomes de diretórios e arquivos
operacionais não devem conter o nome de uma pessoa.

### BR-003 — Fallback não pode cruzar perfis

A ausência de dados de um perfil não autoriza o uso do fallback de outro perfil.

### BR-004 — Dados históricos são distintos dos artefatos operacionais

Documentos históricos podem mencionar decisões ou autores quando isso for necessário
para preservar o histórico do projeto, mas esses documentos não podem ser usados como
fonte de dados da aplicação nem como entrada automática de build/deploy.

### BR-005 — Conflitos de merge não são tratados como garantia absoluta

A refatoração deve remover a principal causa de conflito — dados pessoais no código
compartilhado —, mas não promete eliminar conflitos originados por alterações simultâneas
na mesma lógica ou no mesmo componente.

## 5. Critério de aceite

### AC-001 — Renderização de dois perfis com a mesma base

Dado que a mesma versão do código seja executada em duas instâncias com configurações e
snapshots publicados diferentes  
Quando cada instância carregar sua página pública  
Então cada página deve exibir somente o nome, monograma, imagem, contatos e conteúdo do
seu próprio perfil.

### AC-002 — Falha de carregamento sem vazamento de identidade

Dado que o Supabase esteja indisponível ou que o snapshot do perfil não possa ser lido  
Quando a página pública concluir o carregamento  
Então a aplicação deve exibir fallbacks neutros ou placeholders  
E não deve exibir nomes, imagens, telefones, e-mails ou links pessoais de outra instância.

### AC-003 — Geração com arquivos genéricos

Dado um conteúdo de perfil fornecido como entrada do gerador  
Quando o snapshot ou seed for produzido  
Então os arquivos gerados devem usar nomes funcionais e genéricos  
E o código do gerador não deve depender do nome de João Vitor, Marcos Santos ou outro
autor específico.

### AC-004 — Imagem de perfil configurável

Dado que uma instância possua uma imagem de perfil publicada no Storage ou uma URL de
configuração válida  
Quando o hero for renderizado  
Então deve exibir essa imagem no formato visual atual  
E o template não deve referenciar um arquivo local nomeado por pessoa.

### AC-005 — Destino de contato ausente

Dado que o perfil ativo não possua e-mail, telefone ou rede social configurada  
Quando a seção de contato for renderizada  
Então o canal ausente deve ser ocultado ou permanecer desabilitado  
E nenhum contato de outro perfil deve ser utilizado.

### AC-006 — Referência antiga durante a migração

Dado que exista um import, teste, script ou referência operacional apontando para um
arquivo pessoal antigo  
Quando a validação de build ou teste for executada  
Então a validação deve identificar a referência quebrada antes do deploy  
E a migração só poderá ser considerada concluída após todas as referências operacionais
serem atualizadas.

## 6. Casos de erro / edge cases

- Configuração de perfil ausente → usar fallback neutro e registrar diagnóstico sem
  bloquear a página pública.
- URL de imagem configurada inválida ou indisponível → exibir placeholder neutro, sem
  tentar uma imagem nomeada de outro perfil.
- Snapshot com `profile_id` incompatível com a instância → rejeitar o conteúdo e usar
  fallback neutro.
- Seed sem campos obrigatórios → interromper a geração com erro explícito; não gerar
  snapshot parcialmente pessoal.
- Arquivo antigo referenciado por documentação histórica → pode permanecer se não for
  consumido por build, testes, scripts ou deploy.
- Duas branches alterarem simultaneamente o mesmo componente compartilhado → pode haver
  conflito normal de código e isso permanece fora da garantia desta feature.

## 7. Fora de escopo desta feature

- Implementar um novo sistema de autenticação ou autorização.
- Criar uma segunda aplicação ou um backend próprio.
- Migrar o banco inteiro para um novo modelo multi-tenant se as instâncias continuarem
  usando Supabase separados.
- Alterar a identidade visual ou o layout público além da troca da origem da identidade
  e da imagem de perfil.
- Remover automaticamente todo nome pessoal de documentos históricos ou changelogs.
- Resolver conflitos de merge já existentes por meio de reset, rebase destrutivo ou
  sobrescrita de alterações do usuário.

## 8. Suposições e perguntas abertas

- [x] A imagem de perfil sairá do repositório e será armazenada no Supabase Storage,
      sendo referenciada pelo snapshot publicado.
- [x] As instâncias continuarão usando bancos Supabase separados. Não será criado um
      isolamento multi-tenant por `profile_id` dentro de um banco compartilhado nesta
      feature.
- [x] As variáveis de configuração seguirão o padrão `PORTFOLIO_AUTHOR_NAME`,
      `PORTFOLIO_PROFILE_ID` e `PORTFOLIO_PROFILE_IMAGE_URL`.
- [x] O fallback neutro exibirá um avatar genérico.
- [x] Apenas os artefatos consumidos por código, build e deploy serão renomeados. Specs
      e documentos históricos poderão preservar referências pessoais quando necessárias
      para manter o registro histórico.
- [x] Todas as referências antigas serão atualizadas em um único commit de migração. Não
      haverá etapa temporária de compatibilidade para os caminhos antigos.

## 9. Definition of Done desta feature

- [ ] Critérios de aceite da seção 5 satisfeitos.
- [ ] Código compartilhado não contém dados pessoais hardcoded nem referências a assets
      nomeados por pessoa.
- [ ] Scripts, seeds e snapshots operacionais usam nomes genéricos e entradas
      parametrizadas.
- [ ] Fallbacks não exibem dados de outro perfil.
- [ ] Imagem e contatos do perfil são resolvidos por configuração ou conteúdo publicado.
- [ ] Build, testes e busca automatizada por referências operacionais antigas passam.
- [ ] Experiência pública e área administrativa existentes continuam funcionando.
- [ ] Testado seguindo `spec/05-verificacao/plano-de-teste-template.md`.
- [ ] Eu revisei e aprovei antes do deploy.
