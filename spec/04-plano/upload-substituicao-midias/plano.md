# Plano de Implementação — Upload e substituição de imagens e currículos

Spec relacionada: `spec/03-features/upload-substituicao-midias/spec.md`  
Arquitetura: `spec/02-arquitetura/ARQUITETURA.md`  
Status: Rascunho

## 1. Resumo técnico

A feature será implementada dentro da área administrativa protegida existente, usando
`src/app/features/admin/media-management/`, pasta já prevista na arquitetura. A página
pública continuará usando os serviços de leitura existentes em
`src/app/features/portfolio/content/`; não será criada uma nova rota pública, backend
próprio, bucket ou tabela de conteúdo.

O fluxo administrativo usará o cliente Supabase já configurado para validar o arquivo,
enviá-lo ao bucket correto, persistir ou atualizar a referência em
`portfolio_project_images` ou `portfolio_files` e remover o objeto anterior após uma
substituição. Se a persistência falhar depois do upload, o novo objeto será removido.

Antes da implementação será registrado um Registro de Decisão para a consistência entre
Storage e PostgreSQL, a limpeza compensatória e a regra de que a última substituição
confirmada prevalece. Essa decisão é necessária porque Storage e PostgreSQL não formam
uma transação única pelo cliente frontend.

## 2. Impacto no que já existe

| Componente/arquivo                                                 | Mudança                                                                                                           | Risco                                                                                |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/app/features/admin/admin-page/admin-workspace.ts`             | Compor a gestão de mídia junto ao workspace autenticado existente                                                 | Médio: alteração no container pode afetar a tela atual de gestão de conteúdo         |
| `src/app/features/admin/content-management/`                       | Integrar a entrada para mídia sem duplicar autenticação ou regras de conteúdo                                     | Médio: regressão na edição administrativa existente                                  |
| `src/app/core/auth/`                                               | Reutilizar guard, sessão e autorização sem alterar o contrato                                                     | Alto: qualquer alteração indevida pode expor escrita administrativa                  |
| `src/app/core/supabase/`                                           | Reutilizar cliente e configuração por ambiente para Storage e Data API                                            | Alto: não pode introduzir `service_role`, segredo ou cliente paralelo                |
| `src/app/features/portfolio/content/portfolio-content.models.ts`   | Reutilizar ou completar os contratos de imagem e arquivo usados na leitura e edição                               | Médio: mudança incompatível pode quebrar a página pública                            |
| `src/app/features/portfolio/content/portfolio-content.service.ts`  | Preservar os métodos de leitura e, se necessário, expor somente os contratos compartilhados para a mídia          | Alto: leitura pública deve continuar funcionando após substituições                  |
| `supabase/migrations/20260923194714_create_portfolio_content.sql`  | Reutilizar tabelas, buckets, constraints e policies já aplicados; não editar a migration existente                | Alto: divergência entre Storage e referências pode quebrar o conteúdo público        |
| `supabase/migrations/20260923200309_restrict_portfolio_grants.sql` | Reutilizar grants atuais e complementar, em nova migration, apenas a remoção administrativa necessária no Storage | Crítico: concessão ampla de `delete` poderia permitir exclusão indevida              |
| `src/app/features/portfolio/presentation/portfolio-page/`          | Nenhuma mudança funcional prevista; apenas regressão da leitura do novo arquivo                                   | Médio: URL antiga ou nova associação pode deixar imagem/currículo indisponível       |
| Suíte de testes existente                                          | Adicionar cobertura da área administrativa, Storage, policies, substituição e regressão pública                   | Alto: testes insuficientes podem mascarar perda de arquivo ou escrita não autorizada |

Não haverá nova estrutura fora da arquitetura: `media-management` já está definido para
imagens e currículos, `portfolio/content` continua sendo o domínio compartilhado, e
`supabase/migrations` continua sendo o único caminho para mudanças de grants, policies ou
funções SQL.

## 3. Componentes novos

- Serviço administrativo de mídia em `src/app/features/admin/media-management/`, responsável
  por upload, persistência da referência, substituição e coordenação da limpeza.
- Modelos e contratos administrativos de mídia, reutilizando os tipos públicos de projeto,
  imagem e arquivo quando forem compatíveis.
- Validações de imagem de projeto: PNG/JPG/JPEG e até 1 MB.
- Validação de currículo: `application/pdf`, locale `pt-BR` ou `en`.
- Interface administrativa para:
  - escolher um projeto e adicionar uma imagem;
  - escolher uma imagem específica existente para substituição;
  - escolher o locale e adicionar ou substituir o currículo correspondente;
  - exibir carregamento, sucesso e falha sem falso sucesso.
- Orquestração de limpeza do novo objeto quando a referência não puder ser persistida e
  do objeto anterior após substituição confirmada, conforme o Registro de Decisão.
- Testes unitários, de integração com mocks do Supabase e de autorização para os fluxos
  de mídia.

Não serão criados bucket, tabela de conteúdo, rota pública, cliente Supabase paralelo,
backend próprio ou componente global fora dos limites definidos na arquitetura.

## 4. Mudança de dados/banco (se houver)

Será criada uma migration versionada, sem alterar migrations já aplicadas, para:

- permitir `delete` em `storage.objects` somente para o administrador autenticado e
  autorizado por `public.portfolio_admins`;
- limitar a operação aos buckets `project-images` e `curricula`;
- manter a leitura pública e negar escrita anônima;
- preservar as constraints existentes de imagens, o contrato PDF dos currículos, a
  relação projeto → imagens e a unicidade de um currículo por locale;
- criar, caso o Registro de Decisão aprove essa estratégia, a função SQL mínima para
  serializar a atualização do alvo e retornar o `storage_path` anterior, sem criar nova
  tabela.

O banco manterá o mesmo registro ao substituir uma imagem específica, preservando seu
`id` e `display_order`; serão atualizados apenas referência, nome, MIME e tamanho. Para
currículos, a atualização continuará identificada por `file_type = 'curriculum'` e pelo
locale.

Sequência a validar no Registro de Decisão:

1. validar arquivo e alvo;
2. enviar o novo objeto para um caminho único no bucket;
3. persistir a nova referência sob a regra de concorrência aprovada;
4. remover o objeto anterior após a associação confirmada;
5. remover o novo objeto se a persistência falhar;
6. só informar sucesso quando as etapas obrigatórias forem confirmadas.

Rollback: remover a policy/grant de `delete` e qualquer função SQL criada pela migration,
sem apagar manualmente dados ou objetos. O rollback da aplicação deve interromper novos
uploads/substituições e preservar a última associação válida; operações já concluídas não
devem ser revertidas por exclusão manual.

## 5. Sequência de implementação

### Fase 1 — Base

1. Conferir a Spec aprovada contra as constraints, grants, policies, buckets e serviços
   existentes.
2. Resolver no Registro de Decisão a consistência entre Storage e PostgreSQL, a limpeza
   de objetos órfãos, a falha na remoção do objeto anterior e a prevalência da última
   operação confirmada.
3. Definir os contratos de alvo: imagem identificada pelo registro específico e currículo
   identificado por locale.
4. Criar a migration versionada para remoção administrativa restrita no Storage e, se
   aprovado, a função SQL de serialização.
5. Integrar a nova capacidade ao workspace `/admin` sem alterar autenticação, guard ou a
   leitura pública.

### Fase 2 — Lógica principal

1. Implementar validação de MIME, tamanho, locale e existência do projeto/alvo.
2. Implementar o upload de novas imagens e novos currículos para os buckets existentes.
3. Persistir referências e metadados nas tabelas existentes, respeitando as constraints.
4. Implementar substituição de uma imagem específica preservando seu registro e ordem.
5. Implementar substituição do currículo do locale mantendo no máximo um registro corrente.
6. Implementar a remoção do objeto anterior e a limpeza compensatória de objetos órfãos.
7. Implementar a regra de concorrência definida no Registro de Decisão, garantindo que a
   última operação confirmada prevaleça.
8. Mapear erros de validação, Storage, Data API e policies para estados identificáveis,
   sem alterar a leitura pública existente.

### Fase 3 — Interface

1. Adicionar a entrada de gestão de mídia ao workspace administrativo protegido.
2. Criar o fluxo de upload de imagem vinculada a um projeto.
3. Criar o fluxo de seleção e substituição de uma imagem específica.
4. Criar os fluxos de upload e substituição de currículo para `pt-BR` e `en`.
5. Exibir estados de carregamento, sucesso e erro; não exibir confirmação antes da
   conclusão das etapas obrigatórias.
6. Confirmar que a página pública passa a ler a nova associação sem alteração de layout,
   navegação ou regra de idioma.

### Fase 4 — Testes

1. Testar validações de imagem, currículo, locale, projeto e registro de imagem.
2. Testar upload novo, persistência de metadados e leitura pública da referência.
3. Testar substituição de imagem específica, preservação de `display_order` e remoção do
   objeto anterior.
4. Testar substituição de currículos por locale e preservação da unicidade.
5. Testar falha de Storage, falha de persistência, remoção de órfão e falha de remoção do
   objeto anterior conforme a decisão aprovada.
6. Testar concorrência e confirmar que a última operação confirmada prevalece.
7. Verificar Storage, grants e policies com `anon`, conta autenticada não autorizada e
   Marcos autorizado.
8. Executar regressão da autenticação, área administrativa, alternância de idioma,
   projetos, imagens públicas, currículos e build.
9. Comparar Spec ↔ plano ↔ tarefas ↔ código ↔ testes e registrar divergências.

### Fase 5 — Entrega (deploy/rollback)

1. Documentar a migration, as policies, a sequência operacional, o rollback e o
   tratamento de falhas sem incluir segredos.
2. Aplicar a migration em ambiente controlado e guardar evidências de grants, policies,
   buckets e constraints.
3. Validar os fluxos com a conta autorizada e confirmar que visitantes não escrevem nem
   removem objetos.
4. Validar a leitura pública das imagens e currículos após upload e substituição.
5. Submeter Spec, ADR, plano, tarefas, diff e evidências para revisão de Marcos.
6. Não executar deploy antes da aprovação final de Marcos.

## 6. Riscos

| Risco                                                                                                                    | Chance | Impacto | Como mitigar                                                                                                                                                 | Merece Registro de Decisão?                                     |
| ------------------------------------------------------------------------------------------------------------------------ | ------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| A Spec coloca a remoção de objetos do Storage como requisito, mas também lista a exclusão de objetos como fora de escopo | Média  | Crítico | Reconciliar o texto antes do código, deixando explícito que a remoção automática em substituição/limpeza é permitida e que não existe exclusão manual avulsa | Sim — registrar a interpretação aprovada antes da implementação |
| Grants/policies atuais negam `delete` em `storage.objects`                                                               | Alta   | Crítico | Migration separada com bucket allowlist, `auth.uid()`/`portfolio_admins`, teste negativo com anon e conta não autorizada e rollback                          | Sim — registrar o limite de remoção administrativa              |
| Storage e PostgreSQL não possuem transação única                                                                         | Alta   | Crítico | ADR com sequência compensatória, limpeza de órfão, tratamento da falha de remoção anterior e confirmação de sucesso somente após as etapas obrigatórias      | Sim                                                             |
| Substituições concorrentes podem apagar o arquivo errado ou deixar a associação defasada                                 | Média  | Crítico | Serializar o alvo ou usar atualização condicional conforme ADR; testar duas operações simultâneas e confirmar que a última prevalece                         | Sim                                                             |
| Alterar o workspace administrativo pode quebrar a gestão de conteúdo existente                                           | Média  | Alto    | Reutilizar a rota e o guard atuais, isolar `media-management` e executar regressão do editor existente                                                       | Não; a arquitetura já define o container protegido              |
| Uma substituição pode deixar a página pública sem arquivo ou URL válida                                                  | Média  | Alto    | Persistir nova referência antes de remover o objeto anterior, manter leitura pública somente leitura e testar recarga após cada operação                     | Não; mitigação segue a Spec                                     |
| O currículo possui contrato PDF, mas a validação precisa existir no frontend e no bucket/banco                           | Baixa  | Alto    | Reutilizar constraint e bucket existentes, validar antes do upload e cobrir MIME inválido                                                                    | Não; contrato já foi aprovado                                   |
| Caminhos de Storage previsíveis podem causar colisão ou sobrescrita indevida                                             | Média  | Alto    | Gerar caminhos únicos por operação, persistir o caminho efetivamente usado e testar substituições repetidas                                                  | Não; detalhe de implementação reversível                        |

## 7. Perguntas abertas antes de começar

- A Spec aprovada precisa registrar explicitamente que a remoção automática do objeto
  anterior e de objetos órfãos é uma exceção à exclusão manual fora de escopo.
- O Registro de Decisão deve definir o comportamento quando a nova referência já foi
  persistida, mas a remoção do objeto anterior falha, incluindo retry, compensação ou
  estado operacional para nova tentativa.
- O Registro de Decisão deve aprovar a estratégia de serialização/atualização usada para
  garantir que a última substituição confirmada prevaleça sem apagar o objeto corrente de
  outra operação.
- Nenhuma implementação deve começar enquanto essas decisões não estiverem registradas
  e aprovadas por Marcos.
