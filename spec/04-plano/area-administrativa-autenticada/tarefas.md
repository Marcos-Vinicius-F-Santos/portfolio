# Tarefas — Área administrativa autenticada

Plano relacionado: `spec/04-plano/area-administrativa-autenticada/plano.md`  
Spec relacionada: `spec/03-features/area-administrativa-autenticada/spec.md`  
Status: Rascunho

## Regra das tarefas

Cada tarefa é pequena o suficiente para ser revisada de uma vez, referencia o requisito
que implementa e define como verificar que ficou pronta. Executar em ordem numérica, sem
pular fases. Nenhuma tarefa está concluída antes da implementação e da verificação.

## Fase 1 — Base

- [x] T-001 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006] Registrar as decisões que bloqueavam a implementação.
  - Arquivos/módulos: Spec da feature, plano e configuração operacional do Supabase, sem registrar credenciais.
  - Verificação: UUID `21fbb14d-8e11-4166-b320-639d8a7cb4df`, vinculação manual, rota `/admin`, sessão persistente somente para Marcos e tratamento visual padrão estão aprovados e documentados; não há decisão necessária escondida no código.

- [ ] T-002 [FR-001, FR-005] Confirmar e reutilizar a configuração e o cliente Supabase existentes.
  - Arquivos/módulos: `src/app/core/supabase/supabase-client.ts`, `src/app/core/config/supabase-runtime-config.ts`, `package.json` e `package-lock.json`.
  - Verificação: cliente usa somente URL e publishable key por ambiente, dependência permanece fixada e nenhum segredo ou `service_role` aparece no código, diff ou bundle.

- [ ] T-003 [FR-003, FR-004, FR-006] Confirmar a allowlist e as policies existentes para a conta de Marcos.
  - Arquivos/módulos: `supabase/migrations/20260923194714_create_portfolio_content.sql`, migration de grants/policies e ambiente Supabase autorizado.
  - Verificação: a conta com UUID `21fbb14d-8e11-4166-b320-639d8a7cb4df` está vinculada manualmente a `public.portfolio_admins`; uma consulta controlada distingue Marcos de uma conta autenticada não autorizada; não é necessário alterar schema.

## Fase 2 — Lógica principal

- [ ] T-004 [FR-001, FR-005, FR-006] Criar o serviço de autenticação por e-mail e senha.
  - Arquivos/módulos: `src/app/core/auth/` e testes unitários correspondentes.
  - Verificação: credenciais válidas da conta autorizada retornam estado autenticado e sessão persistente; credenciais inválidas, falhas do Supabase e contas não autorizadas retornam erro identificável sem manter sessão administrativa.

- [ ] T-005 [FR-003, FR-004] Criar o serviço de autorização do único administrador.
  - Arquivos/módulos: `src/app/core/auth/` e integração de consulta à allowlist existente.
  - Verificação: somente a identidade de Marcos é autorizada; a regra não depende de `user_metadata`, de dados editáveis pelo usuário ou de `service_role`.

- [ ] T-006 [FR-002, FR-003, FR-004, FR-006] Criar o guard das funcionalidades administrativas.
  - Arquivos/módulos: `src/app/core/auth/` e testes do guard.
  - Verificação: visitante não autenticado e conta autenticada não autorizada são bloqueados; Marcos autenticado consegue prosseguir; falha na verificação não vira autorização implícita e não deixa sessão não autorizada persistida.

- [ ] T-007 [FR-002, FR-003, FR-004, FR-005] Integrar o guard à configuração de rotas da aplicação.
  - Arquivos/módulos: `src/app/app.routes.ts` ou composição equivalente, `src/app/app.config.ts` e `src/app/app.ts`.
  - Verificação: `/admin` pode ser acessado diretamente para exibir a entrada de autenticação; o container das funcionalidades administrativas só renderiza após o guard autorizar Marcos; a rota pública continua acessível sem login.

## Fase 3 — Interface

- [ ] T-008 [FR-001, FR-005] Criar a tela de entrada administrativa em `/admin` com e-mail, senha e ação de autenticação.
  - Arquivos/módulos: `src/app/features/admin/authentication/`.
  - Verificação: a submissão chama o serviço de autenticação; credenciais válidas da conta de Marcos levam à área protegida; campos inválidos não concedem acesso; não existe link para `/admin` na página pública.

- [ ] T-009 [FR-002, FR-003, FR-004] Criar o container mínimo da área administrativa protegida.
  - Arquivos/módulos: `src/app/features/admin/`.
  - Verificação: o container só é renderizado após autorização de Marcos e não contém ainda formulários ou operações de conteúdo fora do escopo.

- [ ] T-010 [FR-002, FR-003, FR-004, FR-005] Aplicar o tratamento visual padrão para os erros de acesso.
  - Arquivos/módulos: tela em `src/app/features/admin/authentication/` e componentes de rota protegida.
  - Verificação: credenciais inválidas, conta não autorizada e falha do Supabase exibem o tratamento padrão da aplicação sem revelar segredo ou informação indevida.

- [ ] T-011 [FR-002, FR-005, FR-006] Preservar a experiência pública durante a migração para rotas.
  - Arquivos/módulos: `src/app/app.html`, `src/app/app.ts`, `src/app/app.routes.ts` e `src/app/features/portfolio/`.
  - Verificação: a página pública, seus dados, navegação, responsividade e alternância PT/EN continuam funcionando sem autenticação.

## Fase 4 — Testes

- [ ] T-012 [FR-001, FR-005, FR-006] Cobrir autenticação válida, credenciais inválidas, falhas do Supabase Auth e persistência da sessão autorizada.
  - Arquivos/módulos: testes em `src/app/core/auth/` e `src/app/features/admin/authentication/`.
  - Verificação: testes automatizados cobrem AC-001, AC-004 e AC-005, além de indisponibilidade/configuração inválida sem falso sucesso ou sessão não autorizada persistida.

- [ ] T-013 [FR-002, FR-003, FR-004, FR-006] Cobrir autorização e proteção da rota.
  - Arquivos/módulos: testes do serviço de autorização, guard e configuração de rotas.
  - Verificação: testes cobrem AC-002 e AC-003, incluindo conta autenticada não autorizada, falha na checagem de allowlist e encerramento da sessão não autorizada.

- [ ] T-014 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006] Executar verificação integrada com Supabase em ambiente controlado.
  - Arquivos/módulos: migrations/policies existentes, configuração de teste e evidências em `spec/05-verificacao/area-administrativa-autenticada/`.
  - Verificação: Marcos autentica, mantém sessão persistida e acessa; visitante e conta não autorizada não acessam e não mantêm sessão administrativa; nenhuma credencial é gravada nos arquivos ou na saída da verificação.

- [ ] T-015 [FR-002, FR-005, FR-006] Executar regressão pública e validação do build.
  - Arquivos/módulos: `src/app/app.spec.ts`, testes atuais de `src/app/features/portfolio/` e configuração do projeto.
  - Verificação: `npm test -- --watch=false --no-progress` e `npm run build` passam; a página pública e a alternância de idioma continuam disponíveis sem login.

- [ ] T-016 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006] Comparar Spec, plano, tarefas, código e testes.
  - Arquivos/módulos: `spec/03-features/area-administrativa-autenticada/`, `spec/04-plano/area-administrativa-autenticada/`, código e evidências.
  - Verificação: cada FR e AC tem cobertura verificável; divergências, riscos residuais e perguntas não resolvidas estão registradas antes da entrega.

## Fase 5 — Entrega

- [ ] T-017 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006] Documentar configuração, deploy e rollback.
  - Arquivos/módulos: documentação de deploy/verificação da feature, configuração por ambiente e procedimento da allowlist.
  - Verificação: procedimento descreve ordem de configuração, checagens pós-deploy, correção/remoção da vinculação de Marcos e rollback do frontend; não contém senha, token ou chave secreta.

- [ ] T-018 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006] Submeter a feature para revisão e aprovação de Marcos.
  - Arquivos/módulos: diff final, plano, tarefas e evidências de verificação.
  - Verificação: Marcos revisa e aprova Spec ↔ plano/tarefas ↔ código ↔ testes; nenhum deploy é executado antes dessa aprovação.

## Adiado (fora do escopo desta rodada)

- [ ] Operações de criação, edição ou exclusão de textos, experiências, projetos, imagens e currículos.
- [ ] Gestão de múltiplos administradores, papéis ou permissões avançadas.
- [ ] OAuth, cadastro público, recuperação ou alteração de senha.
- [ ] Definição de workflow de rascunho, revisão e publicação.
- [ ] Alteração de schema ou criação de uma nova tabela de administradores, salvo se a verificação encontrar uma insuficiência que exija nova decisão aprovada.
