# Checklist de Convergência — Área administrativa autenticada

Status: Revisão de convergência concluída; divergência e validações pendentes registradas; deploy não aprovado  
Data: 2026-09-24  
Spec: `spec/03-features/area-administrativa-autenticada/spec.md`  
Plano: `spec/04-plano/area-administrativa-autenticada/plano.md`  
Tarefas: `spec/04-plano/area-administrativa-autenticada/tarefas.md`

## Resultado

A implementação local cobre autenticação por e-mail e senha, autorização exclusiva da
conta de Marcos, persistência da sessão autorizada, encerramento de sessões não
autorizadas, rota `/admin` e container protegido. A página pública continua na rota raiz.

A allowlist remota foi consultada somente para leitura e contém o UUID aprovado:
`21fbb14d-8e11-4166-b320-639d8a7cb4df`. A policy remota disponível é
`portfolio_admins_select_self` para `authenticated`.

Foi encontrada uma divergência entre o código e o plano/critério de persistência: a
restauração de sessão em `src/app/features/admin/authentication/admin-authentication.ts`
tenta navegar para `/admin/area`, mas não existe essa rota em
`src/app/app.routes.ts`. O fallback de rota pode redirecionar esse caminho para a página
pública. Por isso, a restauração de sessão e o AC-005 não podem ser considerados
confirmados até a correção e um teste de navegação correspondente.

## Rastreio Spec ↔ Plano/Tarefas ↔ Código ↔ Testes

| Requisito                                 | Código/evidência                                                                         | Teste/verificação                                                                  | Status                                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| FR-001 — autenticar Marcos                | `src/app/core/auth/admin-auth.service.ts`, `src/app/features/admin/authentication/`      | Teste unitário de `signInWithPassword`; teste da entrada `/admin`                  | Confirmado por unidade; login real e integração da submissão pendentes              |
| FR-002 — bloquear não autenticado         | `src/app/core/auth/admin-auth.guard.ts` e rotas                                          | Teste do guard; a definição protegida de `/admin` só combina com sessão autorizada | Confirmado no guard; navegação integrada/manual pendente                            |
| FR-003 — bloquear conta não autorizada    | `admin-authorization.service.ts` e `admin-auth.service.ts`                               | UUID fixo + allowlist; teste de conta diferente encerra sessão                     | Confirmado em código, mock e allowlist; conta alternativa real pendente             |
| FR-004 — somente Marcos                   | `AUTHORIZED_ADMIN_USER_ID` + `public.portfolio_admins`                                   | Consulta remota da allowlist e testes de autorização                               | Confirmado                                                                          |
| FR-005 — Supabase Auth e-mail/senha       | `admin-auth.service.ts` e cliente Supabase                                               | Teste de chamada com e-mail/senha; docs atuais consultadas                         | Confirmado por unidade; submissão real pendente                                     |
| FR-006 — persistência somente para Marcos | `supabase-client.ts` com persistência; `signOut({ scope: 'local' })` para não autorizado | Teste de restauração autorizada e encerramento não autorizado                      | Não confirmado: restauração aponta para `/admin/area` inexistente; browser pendente |

## Critérios de aceite

- [x] AC-001 — fluxo de credenciais válidas implementado e coberto por teste unitário.
      Login real depende de credenciais fornecidas somente no formulário, nunca em arquivo.
- [x] AC-002 — visitante não autenticado não combina com a definição protegida pelo
      guard; a segunda definição de `/admin` exibe a entrada de login.
- [x] AC-003 — conta autenticada diferente é rejeitada, encerrada localmente e não
      renderiza o container administrativo.
- [x] AC-004 — credenciais inválidas retornam erro genérico sem conceder acesso.
- [ ] AC-005 — a sessão autorizada é consultada por `getUser()` e o cliente está
      configurado para persistência, mas a restauração tenta navegar para `/admin/area`,
      caminho inexistente; a validação de fechar/reabrir navegador também está pendente.

## Prioridade alta do plano de verificação

- [x] 96 testes passaram em 11 arquivos com `npm test -- --watch=false --no-progress`.
- [x] `npm run build` passou.
- [x] A allowlist remota foi consultada sem escrita e contém exatamente o UUID aprovado.
- [x] A policy `portfolio_admins_select_self` foi confirmada remotamente.
- [x] A autorização não usa `user_metadata`, `service_role` ou segredo no frontend.
- [ ] Login real de Marcos em `/admin` ainda precisa ser executado manualmente.
- [ ] Tentativa manual com conta diferente e reabertura do navegador ainda precisam ser
      validadas no ambiente aprovado.
- [ ] A navegação após restauração de sessão persistida ainda não possui teste integrado
      e depende da correção do caminho `/admin/area`.

## Arquitetura e regressão

- [x] O código novo respeita `src/app/core/auth/`, `src/app/features/admin/` e a
      composição da aplicação em `src/app/app.routes.ts`.
- [x] Nenhum backend novo, tabela nova, migration ou operação de conteúdo foi criada.
- [x] A página pública continua na rota raiz e os testes existentes continuam passando.
- [x] A rota `/admin` não foi adicionada à navegação pública.
- [x] Nenhum segredo, `service_role` ou senha foi versionado.
- [ ] A restauração de sessão usa um caminho (`/admin/area`) que não está definido nas
      rotas atuais; há risco de retorno indevido à página pública.
- [ ] Avisos de orçamento do build permanecem: bundle inicial acima de 500 kB e stylesheet
      público acima do orçamento configurado. Não impedem a compilação, mas devem ser
      revisados antes do deploy se Marcos considerar prioridade.

## Supabase e segurança

- [x] Migrations remotas e locais estão alinhadas; nenhuma migration nova foi necessária.
- [x] UUID de Marcos vinculado a `public.portfolio_admins` foi confirmado por consulta
      somente-leitura.
- [x] Sessão restaurada usa `auth.getUser()` antes da autorização.
- [x] Advisor de segurança executado sem falha bloqueante.
- [ ] Advisor mantém WARN sobre proteção contra senhas comprometidas desativada; decisão
      e configuração ficam pendentes antes do deploy.

## Divergências e decisões conscientes

1. Para permitir que visitantes cheguem ao login por `/admin` sem acessar funções
   administrativas, existem duas definições do mesmo caminho: `CanMatch` renderiza o
   container somente para Marcos e a rota de fallback renderiza apenas o login. Isso
   preserva a URL aprovada sem liberar funcionalidades administrativas.
2. A validação de login, persistência entre sessões do navegador e conta alternativa real
   não foi executada manualmente porque senhas não podem ser armazenadas nem solicitadas
   por comando. Os testes automatizados e a consulta de allowlist cobrem a parte segura
   verificável sem credenciais.
3. O tratamento visual usa uma mensagem genérica padrão para não revelar se uma conta
   existe ou está autorizada.
4. Divergência a corrigir antes do deploy: `restoreSession()` navega para `/admin/area`,
   mas a composição de rotas define apenas `/admin`; não há teste que cubra esse retorno
   após uma sessão persistida.
5. Os arquivos do plano e das tarefas ainda exibem `Status: Rascunho`, embora a aprovação
   tenha sido informada fora dos arquivos; isso é uma divergência documental, não uma
   autorização para marcar tarefas como concluídas.

## Decisão do portão

- [x] Convergência técnica local revisada.
- [ ] Divergência de navegação da sessão persistida corrigida e retestada.
- [ ] Validação manual de autenticação aprovada.
- [ ] Marcos revisou e aprovou antes do deploy.
- [ ] Deploy aprovado.
