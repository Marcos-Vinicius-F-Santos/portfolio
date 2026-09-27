# Plano de Implementação — Gestão de conteúdo pela área administrativa

Spec relacionada: `spec/03-features/gestao-conteudo-administrativo/spec.md`  
Status: Aprovado

## 1. Resumo técnico

Reutilizar a autenticação, o guard, a rota `/admin`, o cliente Supabase e a configuração
por ambiente já existentes. A área administrativa atualmente renderiza somente um
container mínimo em `src/app/features/admin/admin-page/`; esta feature evoluirá esse
container para a gestão de conteúdo, sem criar uma nova área de autenticação ou uma
segunda rota administrativa protegida.

A interface e o estado dos formulários viverão em
`src/app/features/admin/content-management/`, conforme a arquitetura. Regras de
leitura, mapeamento, modelos compartilhados e acesso persistido ao conteúdo continuarão
no domínio existente `src/app/features/portfolio/content/`, evitando chamadas diretas ao
Supabase nos componentes administrativos e evitando duplicação das regras usadas pela
página pública.

As tabelas já existentes serão reutilizadas onde atendem ao contrato:

- `portfolio_texts` e `portfolio_text_translations` para textos e resultados que já são
  representados por chaves de conteúdo;
- `portfolio_experiences` e `portfolio_experience_translations` para experiências;
- `portfolio_projects` e `portfolio_project_translations` para projetos, incluindo
  `project_type` e `display_order` já definidos por migrations anteriores.

Habilidades, formação e contatos ainda são catálogos constantes em
`src/app/features/portfolio/content/portfolio-content.ts`. Eles não podem ser
adicionados ou editados de forma persistente enquanto permanecerem somente no código.
Antes da implementação da migration será necessário registrar a decisão do modelo
persistido para esses três tipos, usando as migrations e o domínio de conteúdo já
existentes, sem criar uma nova camada de backend ou uma nova pasta global.

Cada conteúdo editável terá uma caixa para `pt-BR` e outra para `en`. Os campos
obrigatórios seguirão as specs específicas já aprovadas. Quando houver `display_order`,
a área administrativa permitirá alterá-lo. A operação de “adicionar texto/resultado”
ficará limitada aos itens, seções e chaves públicas já existentes; não serão criados
novos blocos de layout nesta feature. O salvamento só será confirmado após a
persistência; uma falha após a persistência deverá ser registrada por um mecanismo
simples, a ser escolhido durante a implementação.

Imagens de projetos, arquivos de currículo, exclusão de conteúdo, workflow de rascunho e
publicação posterior permanecem fora desta rodada.

## 2. Impacto no que já existe

| Componente/arquivo                                                | Mudança                                                                                                                                                                                               | Risco                                                                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/app/features/admin/admin-page/admin-workspace.ts`            | Substituir o container mínimo pela composição da gestão de conteúdo, mantendo a rota protegida existente                                                                                              | Alto: uma alteração no container pode quebrar o acesso administrativo já validado                               |
| `src/app/app.routes.ts`                                           | Reutilizar a rota `/admin` protegida e, se necessário, adicionar navegação interna sem criar outra regra de autenticação                                                                              | Médio: configuração incorreta pode expor a área ou impedir o login                                              |
| `src/app/features/portfolio/content/portfolio-content.models.ts`  | Compartilhar modelos editáveis e contratos de validação para leitura pública e administração                                                                                                          | Alto: um contrato divergente pode publicar dados incompletos ou quebrar consumidores existentes                 |
| `src/app/features/portfolio/content/portfolio-content.service.ts` | Preservar a leitura pública e extrair/reutilizar mapeamentos para os serviços de gestão, sem chamadas diretas nos componentes                                                                         | Alto: alterações de consulta podem causar regressão na página pública ou no fallback de idioma                  |
| `src/app/features/portfolio/content/portfolio-content.ts`         | Migrar gradualmente habilidades, formação, contatos e textos administráveis de constantes locais para a fonte persistida, mantendo somente textos de interface que não pertençam ao conteúdo editável | Alto: remover constantes antes de confirmar a leitura persistida pode deixar seções públicas vazias             |
| `src/app/features/admin/content-management/`                      | Criar os formulários, estado de edição, feedback de salvamento e composição da área de conteúdo                                                                                                       | Médio: duplicação de regra ou estado de idioma pode gerar dados divergentes                                     |
| `supabase/migrations/`                                            | Criar migration(s) versionada(s) somente para as estruturas que o modelo aprovado exigir e suas policies RLS                                                                                          | Crítico: migration incompleta ou sem rollback pode quebrar leitura pública e tornar dados difíceis de recuperar |
| Policies e grants do Supabase                                     | Garantir `select` público e `insert/update` somente para Marcos, sem conceder `delete` nesta feature                                                                                                  | Crítico: policy permissiva pode permitir alteração anônima do portfólio                                         |
| `src/app/features/portfolio/presentation/portfolio-page/`         | Ajustar a leitura das seções que deixarão de depender exclusivamente de constantes locais                                                                                                             | Alto: a página pública existente deve continuar funcional e somente leitura                                     |
| Testes existentes de autenticação, conteúdo e página pública      | Adicionar cobertura administrativa e atualizar apenas expectativas impactadas pela fonte persistida                                                                                                   | Médio: testes frágeis podem mascarar regressões de idioma, ordenação ou proteção                                |

## 3. Componentes novos

- Serviço de gestão de conteúdo no domínio administrativo, em
  `src/app/features/admin/content-management/`, responsável por coordenar carregamento,
  edição e salvamento, delegando persistência aos serviços do domínio de conteúdo.
- Adaptadores/repositórios de conteúdo no diretório existente
  `src/app/features/portfolio/content/`, compartilhando modelos, mapeamentos de locale,
  campos obrigatórios e normalização entre a página pública e a área administrativa.
- Modelos de formulário para cada grupo de conteúdo: textos/resultados, experiências,
  projetos, habilidades, formação e contatos.
- Composição protegida da área administrativa com uma caixa de edição para português e
  outra para inglês em cada conteúdo traduzível.
- Validação dos campos obrigatórios conforme as specs específicas, usando a mensagem
  padrão de validação da aplicação.
- Registro simples de falhas da operação de conteúdo, dentro do domínio da feature,
  usando o mecanismo observável escolhido durante a implementação. Não será criada
  infraestrutura de monitoramento específica nesta feature.
- Testes unitários, de integração e de fluxo completo para persistência, RLS, feedback de
  erro, idioma, ordem e regressão pública.

Não será criada nova pasta de infraestrutura, backend próprio, CMS, componente global ou
rota pública. A estrutura existente atende aos limites da arquitetura; a única extensão
estrutural prevista é a pasta de domínio administrativo já indicada na arquitetura e
eventuais tabelas/migrations necessárias dentro do Supabase existente.

## 4. Mudança de dados/banco

As tabelas de textos, experiências e projetos já existentes devem ser reutilizadas. As
policies de `insert` e `update` existentes devem ser verificadas e ajustadas somente se
algum campo ou nova relação exigir isso.

Habilidades, formação e contatos hoje estão representados por constantes locais e não
possuem estrutura persistida equivalente. Como a feature exige adicionar e editar esses
conteúdos, a implementação deverá, após aprovação do Registro de Decisão, criar uma ou
mais estruturas relacionais dentro do mesmo domínio de conteúdo, com:

- locale `pt-BR` e `en` quando o item possuir texto traduzível;
- campos de identificação e ordem necessários para editar e renderizar o item;
- metadados específicos de contato, como destino e símbolo, sem sincronização externa;
- RLS para leitura pública e escrita somente do administrador autorizado;
- grants coerentes com as tabelas existentes, sem permissão de `delete` nesta feature.

O desenho exato das tabelas, nomes de colunas e relações não deve ser inventado durante a
implementação: deve ser registrado no Registro de Decisão recomendado na seção 6 e
aprovado antes da migration.

Qualquer migration deverá:

1. auditar registros e constantes atuais antes de alterar a fonte de verdade;
2. transportar somente conteúdo aprovado, sem inventar valores ou classificações;
3. criar constraints e policies compatíveis com os campos obrigatórios das specs;
4. incluir rollback documentado e verificável;
5. preservar o conteúdo público durante a transição;
6. ser aplicada antes de remover o catálogo local correspondente.

Não serão alteradas migrations já aplicadas diretamente. Imagens e currículos continuam
usando as estruturas existentes, mas não serão editados nesta feature.

## 5. Sequência de implementação

### Fase 1 — Base

1. Confirmar a Spec aprovada, a arquitetura e os campos obrigatórios das specs de textos,
   resultados, experiências, projetos, habilidades, formação e contato.
2. Inventariar a diferença entre o contrato público atual, as tabelas do Supabase e o
   comportamento exigido pela área administrativa.
3. Registrar a decisão do modelo persistido para habilidades, formação e contatos antes
   de criar migration ou componente que dependa dessa escolha. A escolha do mecanismo de
   log fica como detalhe simples de implementação e não bloqueia o plano.
4. Definir o contrato de salvamento por locale, a alteração de `display_order`, a
   confirmação de persistência e o comportamento de falha sem alterar a rota protegida
   existente.
5. Criar e revisar as migrations necessárias, policies, grants e rollback; interromper
   a implementação se a auditoria encontrar dados sem classificação ou sem conteúdo
   aprovado.

### Fase 2 — Lógica principal

1. Criar os modelos de edição e validação compartilhados no domínio de conteúdo, sem
   duplicar campos entre a página pública e a administração.
2. Implementar leitura administrativa dos conteúdos existentes e dos novos catálogos
   persistidos, sempre carregando as duas versões de idioma quando aplicável.
3. Implementar adição e edição de textos e resultados dentro das seções e chaves públicas
   já existentes, usando as estruturas de conteúdo e campos obrigatórios correspondentes.
4. Implementar adição e edição de experiências, incluindo as duas traduções e a ordem de
   exibição quando aplicável.
5. Implementar adição e edição de projetos, incluindo tipo profissional/pessoal,
   traduções, links e ordem; não incluir imagens.
6. Implementar adição e edição de habilidades, formação e contatos conforme o modelo
   persistido aprovado; manter destinos externos como dados de contato, não como
   integrações de escrita.
7. Implementar a coordenação de salvamento com confirmação explícita, feedback de
   sucesso/falha e registro de log quando houver falha após a persistência.
8. Integrar a leitura pública à nova fonte persistida somente depois que os fluxos de
   leitura, fallback e migration estiverem verificados, preservando o fallback seguro
   existente durante a transição.

### Fase 3 — Interface

1. Evoluir o workspace protegido existente para apresentar a navegação e os editores de
   conteúdo dentro de `/admin`.
2. Criar os editores de textos/resultados, experiências e projetos com uma caixa para
   português e outra para inglês em cada conteúdo traduzível.
3. Criar os editores de habilidades, formação e contatos com os campos obrigatórios e
   os controles de ordem aplicáveis.
4. Exibir a mensagem padrão de validação para campo obrigatório não preenchido ou valor
   inválido, sem enviar salvamento inválido ao Supabase.
5. Exibir estado de carregamento, confirmação de salvamento e falha de persistência,
   sem afirmar publicação quando não houver confirmação.
6. Garantir que a página pública continue somente leitura e que a alteração salva seja
   obtida pela consulta pública após a operação concluída.

### Fase 4 — Testes

1. Cobrir modelos, validações, locale, normalização de arrays/links e ordenação.
2. Cobrir os serviços de leitura e escrita para cada tipo de conteúdo, incluindo
   persistência das duas caixas de idioma.
3. Cobrir a migration, constraints, grants e RLS com visitante, conta autenticada não
   autorizada e Marcos autorizado.
4. Cobrir falha antes da confirmação, falha após persistência e registro no log, sem
   falso sucesso nem publicação indevida.
5. Executar fluxo integrado de adicionar e editar cada tipo de conteúdo, alterar ordem,
   recarregar a página pública e alternar entre português e inglês.
6. Executar regressão da autenticação, rota `/admin`, página pública, alternância de
   idioma, projetos, experiências, resultados, currículos e imagens já existentes.
7. Comparar Spec ↔ plano ↔ tarefas ↔ código ↔ testes e registrar qualquer divergência
   antes da entrega.

### Fase 5 — Entrega (deploy/rollback)

1. Documentar migrations aplicadas, policies, variáveis públicas, destino do log,
   evidências de verificação e rollback, sem registrar credenciais.
2. Verificar em ambiente controlado que a conta de Marcos consegue editar e que
   visitantes não conseguem escrever.
3. Executar build, testes e verificação pós-deploy da página pública e da área
   administrativa.
4. Submeter o diff, as evidências e este plano para revisão e aprovação de Marcos.
5. Não executar deploy antes da aprovação final de Marcos.

## 6. Riscos

| Risco                                                                                                                | Chance | Impacto | Como mitigar                                                                                                                                                | Merece Registro de Decisão?                                                                                 |
| -------------------------------------------------------------------------------------------------------------------- | ------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Habilidades, formação e contatos não possuem tabelas persistidas; os valores atuais estão hardcoded                  | Alta   | Crítico | Auditar o contrato atual, definir estruturas no domínio existente, criar migration com RLS/grants e só remover constantes após leitura verificada           | Sim — registrar o modelo persistido e a migração dos catálogos em `spec/02-arquitetura/DECISAO_TEMPLATE.md` |
| Um salvamento de entidade com dados base e duas traduções pode persistir parcialmente                                | Média  | Crítico | Definir estratégia atômica ou compensatória antes da implementação, confirmar o estado antes de publicar e registrar falhas após persistência               | Sim — registrar a estratégia de consistência/publicação imediata                                            |
| O destino do “log de falha” ainda não está definido                                                                  | Média  | Médio   | Escolher durante a implementação o mecanismo mais simples já disponível; não criar monitoramento, tabela de auditoria ou integração externa sem necessidade | Não; a decisão pode ser tratada como detalhe de implementação desta feature simples                         |
| A página pública ainda usa catálogos locais e chaves fixas; migrar a fonte de verdade cedo pode deixar seções vazias | Média  | Alto    | Fazer a transição em duas etapas, manter fallback, migrar leitura antes de remover constantes e testar recarga pública                                      | Não inicialmente; registrar ADR se a transição exigir mudança de contrato público                           |
| Alterar o workspace administrativo ou a rota protegida pode quebrar autenticação existente                           | Média  | Alto    | Reutilizar guard/rota atuais, manter o container protegido e executar regressão de login, acesso e página pública                                           | Não; a arquitetura já define a área protegida                                                               |
| Policies novas permitirem escrita anônima ou escrita fora do administrador                                           | Baixa  | Crítico | Reusar `auth.uid()`, validar RLS com anon/authenticated/admin e não conceder `delete`                                                                       | Não; o limite já está definido pela arquitetura e pela Spec                                                 |
| Alterar as seções/chaves públicas existentes ao cadastrar conteúdo                                                   | Baixa  | Alto    | Limitar a gestão aos itens e chaves já conhecidos pela página pública; novos blocos e mudanças de layout ficam fora desta feature                           | Não; comportamento confirmado por Marcos                                                                    |

## 7. Perguntas abertas antes de começar

- O mecanismo simples de log será escolhido durante a implementação, sem criar
  infraestrutura de monitoramento específica.
- **Decisão confirmada:** “adicionar texto/resultado” significa adicionar ou editar itens
  dentro das seções e chaves públicas já existentes. Novos blocos ou alterações de layout
  não fazem parte desta feature.
- **Decisão confirmada:** o Registro de Decisão do modelo persistido para habilidades,
  formação e contatos deve ser aprovado antes da migration e dos formulários
  correspondentes; Marcos aprovou esse portão.
