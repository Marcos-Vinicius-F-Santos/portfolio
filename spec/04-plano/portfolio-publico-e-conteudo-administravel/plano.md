# Plano de Implementação — Portfólio público e conteúdo administrável

Spec relacionada: `spec/03-features/portfolio-publico-e-conteudo-administravel/spec.md`  
Status: Rascunho

## 1. Resumo técnico

A implementação deve evoluir os domínios Angular já existentes para que a página pública
consuma os conteúdos persistidos e a Admin page administre os mesmos registros, mantendo
as traduções separadas por locale (`pt-BR` e `en`). A leitura pública continuará passando
por `PortfolioContentService`; as escritas continuarão passando por
`AdminContentService`; e os arquivos continuarão sendo tratados por
`MediaManagementService`, usando Supabase PostgreSQL, RLS e Storage.

Não será criada uma nova pasta de feature. A solução estende `portfolio/content/`,
`portfolio/presentation/`, `admin/content-management/` e `admin/media-management/`, que
já são os limites definidos na arquitetura. O layout continuará sendo uma página única,
com novos projetos e conteúdos renderizados por dados, sem alteração manual da estrutura
principal.

A página pública usará `pt-BR` como idioma padrão e fallback por conteúdo. Experiências
serão ordenadas da mais recente para a mais antiga e não exibirão nomes de empresas. A
imagem manual terá precedência quando uma URL pública de ícone estiver inválida ou
indisponível; sem imagem manual, o espaço ficará em branco.

## 2. Impacto no que já existe

| Componente/arquivo                                                                                                             | Mudança                                                                                                                                            | Risco                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `src/app/features/portfolio/presentation/portfolio-page/`                                                                      | Remover numerações, preservar os títulos e a ordem atuais, ampliar “About me”, apresentar contatos compactos/completos e ocultar nomes de empresas | Alto: pode quebrar âncoras, navegação, layout responsivo ou conteúdo já publicado                 |
| `src/app/features/portfolio/content/portfolio-content.service.ts`                                                              | Ler campos novos, aplicar fallback `pt-BR`, ordenar experiências e resolver mídias                                                                 | Alto: falhas de leitura podem deixar a página vazia ou substituir conteúdo por valores incorretos |
| `src/app/features/portfolio/content/portfolio-content.models.ts`                                                               | Representar períodos, situação acadêmica, competências, conteúdos estudados e referências de ícones                                                | Médio: contratos incompatíveis podem quebrar componentes e testes existentes                      |
| `src/app/features/portfolio/content/portfolio-content.ts` e `portfolio-translations.ts`                                        | Manter catálogos atuais como fallback durante a transição, sem duplicar a regra de seleção de locale                                               | Médio: fallback local pode esconder falhas de persistência ou divergir do conteúdo administrativo |
| `src/app/features/admin/content-management/`                                                                                   | Estender modelos, carregamento, formulários e salvamento de textos, experiências, projetos, skills, formação e contatos                            | Alto: gravações relacionadas podem ficar parcialmente persistidas em caso de erro                 |
| `src/app/features/admin/media-management/`                                                                                     | Reutilizar o serviço e a tela existentes para imagens de projetos e adicionar o fluxo de ícone de skill                                            | Alto: upload, referências e limpeza do Storage podem ficar inconsistentes                         |
| `src/app/features/admin/admin-page/` e `src/app/app.routes.ts`                                                                 | Integrar as capacidades na Admin page e preservar a rota protegida atual                                                                           | Médio: pode afetar autenticação, navegação ou operações atuais de inserir/editar/excluir          |
| `supabase/migrations/` e políticas do Supabase                                                                                 | Adicionar campos acadêmicos, referências de ícone e bucket/policies necessários por migration versionada                                           | Alto: alteração de schema, RLS ou Storage pode afetar produção e exige rollback seguro            |
| Tabelas `portfolio_experiences`, `portfolio_projects`, `portfolio_project_images`, `portfolio_skills` e catálogos relacionados | Preservar registros e regras existentes; não alterar silenciosamente a exclusão atual                                                              | Alto: dados publicados e operações administrativas existentes podem sofrer regressão              |

## 3. Componentes novos

Não há componente ou domínio de alto nível novo previsto. Os componentes existentes serão
estendidos dentro dos limites já definidos:

- `portfolio/content/` continua concentrando modelos, leitura persistida e seleção de
  locale;
- `portfolio/presentation/` continua compondo a página pública e suas seções;
- `admin/content-management/` continua concentrando os formulários e operações de
  conteúdo;
- `admin/media-management/` continua concentrando uploads, referências e operações de
  Storage.

Somente extrair um componente interno adicional se a implementação gerar conteúdo
relacionado suficiente para justificar a subdivisão e se a extração não duplicar regras
de conteúdo. Não criar uma pasta separada por tipo de arquivo nem um backend próprio.

## 4. Mudança de dados/banco

Será necessária uma nova migration versionada, sem editar migrations já aplicadas.
O desenho deve:

- adicionar ao domínio de skills as referências da imagem manual, metadados mínimos e a
  URL pública opcional;
- adicionar ao domínio acadêmico os períodos, a indicação de andamento e os campos
  traduzíveis de competências desenvolvidas e conteúdos estudados;
- manter `portfolio_contact_links` como fonte única dos contatos usados nas duas
  localizações públicas;
- preservar as tabelas de experiências e projetos já existentes, usando suas traduções
  separadas por `pt-BR` e `en`;
- manter o limite de 1 MB já existente para imagens de projetos e aplicar o mesmo limite
  ao armazenamento de ícones manuais de skills;
- criar ou configurar somente o bucket e as policies necessários para ícones de skills,
  mantendo leitura pública e escrita restrita ao administrador autenticado;
- não conceder escrita anônima, não enviar `service_role` ao frontend e não alterar as
  regras atuais de exclusão;
- preservar objetos e registros existentes em caso de rollback.

O rollback deve ocorrer primeiro no código: interromper o consumo dos campos novos e
voltar à leitura dos contratos anteriores. Os campos e objetos novos devem permanecer
preservados até haver backup e confirmação de que nenhum consumidor depende deles; não
remover dados ou objetos manualmente durante o rollback. Uma migration compensatória só
deve remover policies ou estruturas depois de uma revisão explícita e de confirmar que a
versão anterior não as utiliza.

## 5. Sequência de implementação

### Fase 1 — Base

1. Resolver, antes do código, o critério visual ainda aberto para a largura de “About me”
   e registrar como a regra da feature de não exibir empresas convive com
   `DECISAO-001-publicacao-nome-cargo-experiencias.md`.
2. Inventariar o comportamento atual da página pública e da Admin page, incluindo títulos,
   ordem, âncoras, operações de inserir/editar/excluir, catálogos locais, campos já
   persistidos e cobertura existente.
3. Congelar os contratos de domínio para `pt-BR`/`en`, fallback por conteúdo, ordenação
   de experiências, contatos como fonte única, ícones opcionais e limite de 1 MB.
4. Preparar e revisar a migration versionada, suas policies, bucket e procedimento de
   rollback antes de qualquer alteração de serviço ou interface.

### Fase 2 — Lógica principal

1. Estender os modelos e o serviço público para consumir os campos persistidos de skills,
   formação, contatos, experiências e projetos.
2. Implementar o fallback de conteúdo para `pt-BR`, sem substituir o conteúdo inteiro da
   página quando somente uma tradução estiver ausente.
3. Aplicar a ordenação das experiências da mais recente para a mais antiga e impedir que o
   nome da empresa atravesse o DTO de apresentação pública.
4. Estender o serviço administrativo para carregar e salvar os novos campos, mantendo a
   autenticação, os limites da arquitetura e as operações atuais de exclusão.
5. Estender o serviço de mídia para ícones de skills, limite de 1 MB, fallback de URL para
   imagem manual e limpeza compensatória de uploads sem referência.
6. Definir o comportamento de erro de persistência: a UI só deve substituir o estado
   original após confirmação do salvamento, e falhas devem deixar o conteúdo original
   disponível.

### Fase 3 — Interface

1. Ajustar a página pública preservando os IDs e a ordem atual do header, removendo apenas
   as numerações previstas e aplicando a largura aprovada para “About me”.
2. Conectar apresentação inicial e seção final à mesma fonte de contatos.
3. Renderizar skills, formação, experiências e projetos a partir dos contratos persistidos,
   incluindo ausência de ícone, fallback de tradução e imagens de projeto.
4. Atualizar a Admin page com os campos de período, andamento, competências, conteúdos
   estudados, traduções, ícone de skill e edição dos contatos.
5. Preservar feedback de falha sem descartar o conteúdo original e garantir que a
   responsividade não quebre header, navegação, links ou controles administrativos.

### Fase 4 — Testes

1. Cobrir os serviços e modelos com testes unitários para fallback, ordenação, campos
   opcionais, limite de arquivo, fallback de imagem e preservação do estado original.
2. Cobrir a integração dos componentes públicos e administrativos, incluindo sincronização
   dos contatos e publicação imediata após salvamento.
3. Validar a migration, RLS, bucket e ausência de escrita anônima em ambiente controlado,
   sem alterar dados de produção diretamente.
4. Executar os critérios de aceite em desktop e mobile, incluindo regressão do header,
   âncoras, ordem atual das seções, Admin page e operações existentes de inserir/editar/
   excluir.
5. Registrar as evidências e divergências em `spec/05-verificacao/` antes da entrega.

### Fase 5 — Entrega (deploy/rollback)

1. Comparar Spec da Feature ↔ plano ↔ tarefas ↔ código ↔ testes e registrar qualquer
   divergência.
2. Preparar o documento de deploy e rollback, incluindo aplicação versionada da migration,
   validação do Storage/RLS, smoke test público/admin e retorno à revisão anterior.
3. Submeter o resultado para revisão e aprovação de Marcos.
4. Não executar deploy, migration remota ou promoção sem aprovação explícita posterior.

## 6. Riscos

| Risco                                                                                                                                                | Chance | Impacto | Como mitigar                                                                                                                                                            | Merece Registro de Decisão?                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| A feature determina que nomes de empresas não sejam públicos, enquanto `DECISAO-001` e a arquitetura atual permitem publicação aprovada desses nomes | Alta   | Alto    | Resolver o conflito antes da implementação e manter a decisão registrada; a implementação pública deve seguir a Spec aprovada                                           | Sim — revisar `DECISAO-001-publicacao-nome-cargo-experiencias.md` ou criar decisão compensatória |
| Salvamento de uma entidade e suas duas traduções ocorre em várias operações e pode falhar parcialmente                                               | Alta   | Alto    | Definir se será usado RPC transacional, compensação ou outra estratégia compatível com Supabase antes de implementar; testar falha intermediária e preservar o original | Sim — se a estratégia alterar o contrato de persistência ou exigir novas funções SQL             |
| Alterar campos acadêmicos e de skills pode tornar migrations atuais ou dados existentes incompatíveis                                                | Média  | Alto    | Criar migration aditiva, validar registros existentes, não editar migrations aplicadas e preparar rollback sem apagar dados                                             | Não, salvo se for necessário remodelar tabelas existentes                                        |
| Upload de ícone e referência no banco podem divergir entre Storage e PostgreSQL                                                                      | Média  | Alto    | Reutilizar `MediaManagementService`, usar caminhos únicos, confirmar referência antes de publicar e limpar uploads órfãos em falha                                      | Não, desde que siga o padrão de mídia já adotado; sim se exigir novo mecanismo de consistência   |
| Remover numeração ou alterar largura pode quebrar âncoras, ordem e layout responsivo existentes                                                      | Média  | Alto    | Preservar IDs/ordem, medir desktop/mobile e executar regressão visual e de navegação                                                                                    | Não                                                                                              |
| A URL pública da imagem pode falhar depois do cadastro                                                                                               | Média  | Médio   | Resolver erro de carregamento no componente, priorizar imagem manual e deixar vazio quando não houver fallback                                                          | Não                                                                                              |
| Ausência de tradução ou falha de leitura pode substituir o conteúdo por string vazia                                                                 | Média  | Alto    | Aplicar fallback por entidade para `pt-BR` e manter catálogos locais somente como fallback de disponibilidade, com testes explícitos                                    | Não                                                                                              |
| Os tipos exatos de arquivo para upload manual de ícone não estão definidos além do limite de 1 MB                                                    | Média  | Médio   | Reutilizar inicialmente os tipos de imagem já aceitos no domínio de mídia; se for necessário aceitar SVG enviado, atualizar a decisão/spec antes do código              | Sim se houver expansão do contrato de Storage                                                    |

## 7. Perguntas abertas antes de começar

- Qual é o critério visual aprovado para considerar que “About me” ocupa o máximo possível
  da largura sem comprometer a leitura?
- Marcos confirma que a regra desta feature — não exibir nomes de empresas — deve
  substituir o comportamento permitido por `DECISAO-001` e gerar a revisão desse registro?
- Para garantir que o conteúdo original permaneça após falha de persistência, qual
  estratégia deve ser aprovada caso as operações relacionadas não sejam atômicas no
  cliente: função SQL transacional, compensação ou outra abordagem dentro do Supabase?
- O upload manual de ícone de skill deve aceitar somente os tipos de imagem já aceitos
  para imagens de projeto ou também SVG enviado como arquivo? A Spec já define URL pública
  de SVG/imagem e limite de 1 MB, mas não define os MIME types do upload manual.
