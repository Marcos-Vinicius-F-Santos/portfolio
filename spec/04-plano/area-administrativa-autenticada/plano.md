# Plano de Implementação — Área administrativa autenticada

Spec relacionada: `spec/03-features/area-administrativa-autenticada/spec.md`  
Status: Rascunho

## 1. Resumo técnico

Reutilizar o cliente Supabase e a configuração por ambiente já existentes. Criar a
camada de autenticação em `src/app/core/auth/`, usando o Supabase Auth com e-mail e
senha, e validar a autorização de Marcos contra a allowlist
`public.portfolio_admins` já criada pela integração Supabase. A conta autorizada será
identificada pelo UUID `21fbb14d-8e11-4166-b320-639d8a7cb4df`.

Adicionar a rota protegida e a tela mínima de entrada dentro de
`src/app/features/admin/authentication/`, mantendo o domínio administrativo separado
do conteúdo. A composição das rotas ficará no nível da aplicação Angular, porque é o
ponto que conecta a página pública e a nova área administrativa sem criar uma estrutura
paralela à arquitetura definida. A entrada será `/admin`, acessível somente por URL
direta e sem link na página pública; a tela de login pode ser exibida nessa rota, mas o
container das funcionalidades administrativas só será renderizado após a autorização.

A sessão de Marcos será persistida. Se outra conta conseguir autenticar-se no Supabase
Auth, ela será desautorizada e terá a sessão encerrada antes de qualquer persistência ou
acesso administrativo.

Esta rodada implementará somente autenticação e proteção de acesso. Não serão criados
formulários ou operações de edição de conteúdo, projetos, experiências ou imagens.

## 2. Impacto no que já existe

| Componente/arquivo                                 | Mudança                                                                                                             | Risco                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `src/app/app.ts` e `src/app/app.html`              | Trocar a renderização direta por composição de rotas e saída de roteamento, preservando a página pública            | Alto: uma configuração incorreta pode impedir o carregamento público atual       |
| `src/app/app.config.ts`                            | Registrar o roteador e os providers necessários para autenticação/guard                                             | Médio: provider ausente pode quebrar inicialização ou testes                     |
| `src/app/core/supabase/supabase-client.ts`         | Reutilizar o cliente existente para chamadas de Auth; alterar somente se o contrato atual não suportar a integração | Médio: configuração inválida precisa falhar sem conceder acesso                  |
| `src/app/core/config/supabase-runtime-config.ts`   | Reutilizar URL e publishable key existentes, sem adicionar segredo ou `service_role`                                | Alto: exposição de segredo ou configuração errada compromete o acesso            |
| `supabase/migrations/` e `public.portfolio_admins` | Nenhuma mudança de schema prevista; vincular a conta de Marcos à allowlist por procedimento seguro de ambiente      | Alto: ausência ou UUID incorreto pode negar Marcos ou autorizar a conta errada   |
| `src/app/features/portfolio/`                      | Manter página, conteúdo, idioma e leitura pública sem chamadas administrativas                                      | Médio: a nova composição de rotas pode causar regressão na experiência existente |
| `package.json` e `package-lock.json`               | Reutilizar `@angular/router` já declarado; não adicionar dependência de Auth sem necessidade                        | Baixo                                                                            |

## 3. Componentes novos

- Serviço de autenticação em `src/app/core/auth/`, encapsulando login por e-mail e senha,
  consulta de sessão e falhas do Supabase Auth.
- Serviço ou adaptador de autorização em `src/app/core/auth/`, consultando a conta
  autenticada e a allowlist existente, sem usar `user_metadata` para autorização.
- Guard de rota em `src/app/core/auth/` para impedir acesso às funcionalidades sem
  autenticação ou sem autorização de Marcos, mantendo a entrada `/admin` disponível para
  o login.
- Configuração de rotas da aplicação em `src/app/app.routes.ts` ou arquivo equivalente
  de composição, preservando a rota pública e adicionando a rota administrativa
  protegida.
- Tela de entrada e seus testes em `src/app/features/admin/authentication/`.
- Container mínimo da área protegida em `src/app/features/admin/`, sem implementar
  gestão de conteúdo nesta feature.
- Testes unitários e de integração dos serviços, guard, rotas e regressão da página
  pública.

Não será criada nova pasta de infraestrutura, backend próprio ou domínio global de
componentes. A estrutura segue `core/auth/`, `features/admin/authentication/` e a
composição da aplicação já prevista na arquitetura.

## 4. Mudança de dados/banco (se houver)

Não há mudança de schema prevista. A tabela `public.portfolio_admins`, sua relação com
`auth.users` e as policies existentes serão reutilizadas para confirmar que a conta
autenticada é a conta autorizada de Marcos.

A vinculação do UUID da conta de Marcos à allowlist será uma configuração operacional
segura no ambiente Supabase, sem senha, token ou `service_role` no repositório. Antes da
implementação, essa vinculação manual deverá ser executada e verificada no ambiente
Supabase autorizado.

Se a verificação revelar que o schema ou as policies existentes não atendem aos
requisitos FR-003 e FR-004, a implementação deve parar e uma migration versionada deve
ser planejada separadamente, com rollback definido. Não alterar migration já aplicada
diretamente.

## 5. Sequência de implementação

### Fase 1 — Base

1. Registrar as decisões já aprovadas: UUID da conta de Marcos,
   `portfolio_admins` vinculado manualmente, sessão persistente somente para Marcos,
   tratamento visual padrão e rota `/admin` sem link público.
2. Confirmar a versão já instalada de `@supabase/supabase-js`, a configuração pública
   por ambiente e o contrato atual do cliente Supabase.
3. Confirmar que a allowlist `public.portfolio_admins` e suas policies permitem validar
   a conta autenticada sem usar `user_metadata`, `service_role` ou segredo no frontend.
4. Registrar qualquer divergência arquitetural como Registro de Decisão antes de criar
   uma estrutura diferente da prevista.

### Fase 2 — Lógica principal

1. Implementar o serviço de autenticação usando o método de e-mail e senha do Supabase
   Auth, com falhas identificáveis e sem conceder acesso quando a configuração ou o
   serviço estiver indisponível.
2. Implementar a verificação de autorização de Marcos usando a identidade autenticada e
   a allowlist existente.
3. Implementar a persistência da sessão autorizada e encerrar imediatamente a sessão
   de uma conta autenticada não autorizada.
4. Implementar o guard das funcionalidades administrativas, cobrindo visitante não
   autenticado, conta autenticada não autorizada e Marcos autorizado.
5. Integrar o guard à configuração de rotas sem alterar os contratos dos serviços de
   conteúdo público.

### Fase 3 — Interface

1. Criar a entrada `/admin` com campos de e-mail e senha e ação de autenticação, sem
   adicionar link para ela na página pública.
2. Exibir o tratamento visual padrão para credenciais inválidas, conta não autorizada
   ou indisponibilidade do Supabase, sem revelar informação sensível.
3. Criar o container mínimo da rota protegida e manter as funcionalidades de edição
   fora desta rodada.
4. Migrar a composição da aplicação para o roteador preservando a página pública, sua
   navegação e a alternância de idioma.

### Fase 4 — Testes

1. Testar autenticação válida, credenciais inválidas e falha do Supabase Auth.
2. Testar o guard para visitante, conta não autorizada e conta de Marcos.
3. Testar a navegação entre a página pública e a área administrativa protegida.
4. Executar regressão da página pública, alternância de idioma, build e testes atuais.
5. Verificar a allowlist e as policies em ambiente local ou de teste, sem expor
   credenciais e sem alterar dados de produção sem procedimento aprovado.
6. Comparar Spec ↔ plano ↔ tarefas ↔ código ↔ testes antes de marcar a feature como
   concluída.

### Fase 5 — Entrega (deploy/rollback)

1. Documentar as variáveis públicas necessárias, o procedimento de vinculação da conta
   de Marcos e as checagens pós-deploy, sem registrar valores secretos.
2. Documentar rollback do frontend para a versão anterior e o procedimento para remover
   ou corrigir a vinculação da conta autorizada, se necessário.
3. Executar a revisão final de segurança e regressão.
4. Submeter o resultado para revisão e aprovação de Marcos; não executar deploy antes
   dessa aprovação.

## 6. Riscos

| Risco                                                                              | Chance | Impacto | Como mitigar                                                                                                                                                                | Merece Registro de Decisão?                                                                   |
| ---------------------------------------------------------------------------------- | ------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| A introdução do roteador alterar o carregamento da página pública existente        | Média  | Alto    | Migrar a composição incrementalmente, manter a entrada pública explícita e executar regressão de página, idioma e build                                                     | Não; a arquitetura já determina uma aplicação Angular única com rota administrativa protegida |
| UUID incorreto ou ausência da conta de Marcos em `portfolio_admins`                | Média  | Alto    | Confirmar a identidade antes da implementação e testar autorização positiva e negativa em ambiente controlado                                                               | Não; é configuração operacional da allowlist já prevista                                      |
| Uma conta autenticada ser tratada como administradora apenas por estar autenticada | Baixa  | Crítico | Validar a identidade contra `portfolio_admins`, usar `auth.uid()`/identidade autenticada e não usar `user_metadata`                                                         | Não; o limite já está definido pela arquitetura e pela Spec                                   |
| A sessão de uma conta não autorizada permanecer persistida após o login            | Média  | Alto    | Validar o UUID contra `public.portfolio_admins` imediatamente após a autenticação e encerrar a sessão não autorizada antes de renderizar ou persistir a área administrativa | Não; a regra de um único administrador já está definida na arquitetura e na Spec              |
| Mensagens de erro revelarem se uma conta existe ou está autorizada                 | Média  | Médio   | Definir tratamento visual neutro antes da interface e não expor detalhes retornados pelo provedor                                                                           | Não; é decisão de UX dentro da feature, salvo mudança de contrato público                     |
| Alteração futura das APIs do Supabase Auth                                         | Baixa  | Médio   | Confirmar documentação e versão antes da implementação, manter dependência fixada e testar o fluxo real                                                                     | Não                                                                                           |

## 7. Perguntas abertas antes de começar

Não há perguntas abertas bloqueando o início do plano. As decisões foram registradas na
seção 8 da Spec da Feature: UUID autorizado
`21fbb14d-8e11-4166-b320-639d8a7cb4df`, vinculação manual, sessão persistente somente
para Marcos, tratamento visual padrão e rota `/admin` sem link público.
