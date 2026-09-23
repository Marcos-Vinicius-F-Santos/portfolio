# Tarefas — Integração com Supabase para conteúdo e arquivos

Plano relacionado: `spec/04-plano/integracao-supabase/plano.md`  
Spec relacionada: `spec/03-features/integracao-supabase/spec.md`  
Status: Implementação concluída — convergência revisada; deploy pendente de aprovação

## Regra das tarefas

Cada tarefa é pequena o suficiente para ser revisada de uma vez, referencia o requisito
que implementa e define como verificar que ficou pronta. Executar em ordem numérica, sem
pular fases. Nenhuma tarefa está concluída antes da implementação e da verificação.

## Fase 1 — Base

- [x] T-001 [FR-008, FR-009, FR-011] Registrar as decisões aprovadas de modelo, autorização, Storage, ambiente e fallback.
  - Arquivos/módulos: seção 7 de `spec/04-plano/integracao-supabase/plano.md`, seção 8 da Spec e eventual ADR somente se houver mudança arquitetural.
  - Verificação: schema de conteúdo, UUIDs, relação projeto → N imagens, único administrador via `auth.uid()`, buckets lógicos, variáveis, fallback local, ausência de seed e regra de arquivos de projeto estão documentados; apenas formato/tamanho de currículo permanece adiado.

- [x] T-002 [FR-001] Criar o novo projeto Supabase e registrar as configurações por ambiente.
  - Arquivos/módulos: `src/app/core/config/` e documentação sem valores reais.
  - Verificação: `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` são lidas por ambiente; nenhum token, senha ou `service_role` aparece no código, diff ou frontend.

- [x] T-003 [FR-001, FR-008] Confirmar versões compatíveis, adicionar o cliente Supabase com versão fixada e preparar a estrutura local.
  - Arquivos/módulos: `package.json`, `package-lock.json`, `src/app/core/supabase/` e `supabase/`.
  - Verificação: documentação/changelog e `supabase --help` consultados, versões registradas, `npm run build` executado e migration inicial criada com `supabase migration new`.

## Fase 2 — Lógica principal

- [x] T-004 [FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Criar a migration do schema relacional aprovado.
  - Arquivos/módulos: `supabase/migrations/`.
  - Verificação: migration aplicada em ambiente local/teste; tabelas, UUIDs, campos do produto, traduções PT/EN, projetos, currículos, metadados e relação direta projeto → N imagens confirmados.

- [x] T-005 [FR-006, FR-007, FR-011] Criar/configurar buckets e policies de Storage.
  - Arquivos/módulos: migration em `supabase/migrations/` e modelos em `src/app/features/portfolio/content/`.
  - Verificação: imagens de projeto PNG/JPG/JPEG até 1 MB podem ser lidas publicamente; upload/atualização exige Marcos; currículos são separados por idioma e não recebem a validação de imagens.

- [x] T-006 [FR-009] Ativar RLS e criar policies para tabelas e Storage.
  - Arquivos/módulos: migration em `supabase/migrations/`.
  - Verificação: `anon` consulta recursos públicos e não escreve; o único administrador autenticado escreve; policies usam `auth.uid()` e não usam `user_metadata` ou `service_role` no frontend.

- [x] T-007 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007] Implementar cliente Supabase e serviços de leitura no domínio de conteúdo.
  - Arquivos/módulos: `src/app/core/supabase/`, `src/app/features/portfolio/content/` e `src/app/app.config.ts`.
  - Verificação: componentes não chamam o banco diretamente; serviços consultam conteúdo, traduções, projetos, imagens e arquivos; erros são propagados de forma identificável.

- [x] T-008 [FR-005, FR-006] Implementar seleção PT/EN e mapeamento da relação projeto → imagens.
  - Arquivos/módulos: `src/app/features/portfolio/content/`.
  - Verificação: o switch seleciona a tradução correta; um projeto retorna várias imagens relacionadas; ausência de tradução ou imagem preserva o fallback por conteúdo.

## Fase 3 — Interface

- [x] T-009 [FR-001, FR-010] Conectar a página pública existente ao serviço de leitura.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/portfolio-page/` e serviços de `content/`.
  - Verificação: página continua em uma única rota, faz somente leitura pública e não contém chamadas diretas ao Supabase.

- [x] T-010 [FR-005] Preservar a alternância de idioma existente ao trocar a fonte local pela persistida.
  - Arquivos/módulos: `portfolio-language*`, `portfolio-content*` e `portfolio-page/`.
  - Verificação: PT/EN continuam alternáveis; IDs, navegação, posição e layout não sofrem regressão.

- [x] T-011 [FR-006, FR-007, FR-011] Conectar referências de imagens e arquivos aos contratos de apresentação existentes, sem criar telas novas.
  - Arquivos/módulos: `src/app/features/portfolio/presentation/` e `content/`.
  - Verificação: referências válidas são consumíveis pela apresentação; binários não são gravados em tabelas; não há UI administrativa nesta rodada.

- [x] T-012 [FR-001, FR-010] Aplicar o fallback local por conteúdo quando o Supabase estiver indisponível.
  - Arquivos/módulos: serviços de conteúdo e `portfolio-page/`.
  - Verificação: falha de configuração/rede não é sucesso indevido; o conteúdo original local permanece disponível conforme FR-009 da Alternância de Idioma.

## Fase 4 — Testes

- [x] T-013 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007] Cobrir serviços, traduções, relação 1:N e erros.
  - Arquivos/módulos: testes em `src/app/features/portfolio/content/` e `src/app/core/supabase/`.
  - Verificação: mocks cobrem sucesso, resposta vazia, tradução/imagem ausente, configuração inválida e indisponibilidade; `npm test -- --watch=false --no-progress` passa.

- [x] T-014 [FR-009, FR-011] Verificar RLS, Storage, Data API e restrições de arquivos de projeto.
  - Arquivos/módulos: migrations, ambiente local/teste e evidências em `spec/05-verificacao/integracao-supabase/`.
  - Verificação: `anon` lê e não escreve; administrador escreve; arquivo inválido não persiste; advisors disponíveis não apontam falhas críticas.
  - Ressalva registrada no checklist: a escrita administrativa foi verificada em transação reversível; o upload HTTP inválido foi validado por bucket/constraint, sem fluxo de Storage real nesta rodada.

- [x] T-015 [FR-008] Verificar aplicação e rollback da migration.
  - Arquivos/módulos: `supabase/migrations/` e procedimento de verificação.
  - Verificação: schema aplicado e conferido por consulta; reversão/compensação documentada sem editar migration já aplicada.

- [x] T-016 [FR-010, FR-005] Executar regressão da página pública e da alternância de idioma.
  - Arquivos/módulos: `portfolio-page.spec.ts`, testes atuais de idioma e verificação manual.
  - Verificação: testes atuais passam, `npm run build` conclui e desktop/móvel exibem leitura pública e PT/EN sem regressão.

- [x] T-017 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011] Comparar Spec, plano, tarefas, código, migrations e testes.
  - Arquivos/módulos: diff completo e `spec/03-features/`, `spec/04-plano/`, `spec/05-verificacao/`.
  - Verificação: cada tarefa referencia FR(s), cada FR possui verificação e divergências estão registradas.

## Fase 5 — Entrega

- [x] T-018 [FR-008, FR-009] Preparar configuração, aplicação da migration e rollback por ambiente.
  - Arquivos/módulos: `spec/06-deploy/integracao-supabase/`, migrations e documentação de variáveis sem valores reais.
  - Verificação: procedimento identifica ordem, revisão, rollback e checagens de segurança; nenhum deploy é executado.

- [x] T-019 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011] Submeter o resultado para revisão e aprovação de Marcos.
  - Arquivos/módulos: resultado final e evidências de `spec/05-verificacao/integracao-supabase/`.
  - Verificação: Marcos aprova Spec ↔ plano/tarefas ↔ código ↔ testes; nenhuma publicação ocorre antes da aprovação.

## Adiado (fora do escopo desta rodada)

- [ ] Tela de login e área administrativa protegida.
- [ ] Fluxos `POST`/`UPDATE` no frontend.
- [ ] Gestão de múltiplos administradores ou papéis.
- [ ] Formato e limite de tamanho dos currículos.
- [ ] Busca avançada, paginação, cache distribuído ou tempo real.
- [ ] Deploy efetivo na Vercel ou publicação do novo projeto Supabase.
