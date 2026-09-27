# Tarefas — Upload e substituição de imagens e currículos

Plano relacionado: `spec/04-plano/upload-substituicao-midias/plano.md`  
Spec relacionada: `spec/03-features/upload-substituicao-midias/spec.md`  
Status: Rascunho

## Regra das tarefas

Cada tarefa é pequena o suficiente para ser revisada de uma vez, referencia o requisito
`FR-XXX` que implementa ou verifica e define como saber que ficou pronta. Executar em
ordem numérica, sem pular fases. Nenhuma tarefa deve ser marcada como concluída antes da
implementação e da verificação correspondente.

## Fase 1 — Base

- [ ] T-001 [FR-005, FR-006, FR-008] Registrar a decisão de consistência entre Storage e PostgreSQL, limpeza compensatória e concorrência.
  - Arquivos/módulos: `spec/02-arquitetura/DECISAO_TEMPLATE.md`, novo registro em `spec/02-arquitetura/`, `spec/03-features/upload-substituicao-midias/spec.md`.
  - Verificação: o registro define a sequência de upload, persistência, remoção do objeto anterior, limpeza de órfão, tratamento de falha de remoção e regra de última operação confirmada; a contradição entre requisito de remoção e exclusão fora de escopo está resolvida; Marcos aprova antes de qualquer código.

- [ ] T-002 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006] Inventariar o contrato atual de projetos, imagens, currículos, buckets, constraints, grants e policies.
  - Arquivos/módulos: `supabase/migrations/`, `src/app/features/portfolio/content/`, `src/app/core/supabase/` e `spec/02-arquitetura/`.
  - Verificação: estão documentados os campos de `portfolio_project_images` e `portfolio_files`, a relação por `project_id`, a unicidade por locale, os buckets existentes, os limites de arquivo e a lacuna atual de `delete` no Storage.

- [ ] T-003 [FR-001, FR-002, FR-004, FR-005, FR-006] Definir os contratos administrativos de alvo e operação de mídia.
  - Arquivos/módulos: `src/app/features/admin/media-management/`, `src/app/features/portfolio/content/portfolio-content.models.ts`.
  - Verificação: uma imagem é identificada pelo registro específico e um currículo pelo locale `pt-BR` ou `en`; o contrato preserva `id`, `display_order`, `storage_path`, nome original, MIME e tamanho necessários à leitura pública.

- [ ] T-004 [FR-003, FR-004, FR-005, FR-006, FR-008] Criar a migration versionada para permitir remoção administrativa restrita no Storage.
  - Arquivos/módulos: `supabase/migrations/<timestamp>_enable_admin_media_replacement.sql`.
  - Verificação: a migration concede `delete` somente a `authenticated`, cria policy condicionada a `portfolio_admins` e aos buckets `project-images`/`curricula`, mantém leitura pública, não concede exclusão de tabelas e possui rollback revisado.

- [ ] T-005 [FR-001, FR-002, FR-007, FR-008] Definir o limite de integração com o workspace administrativo existente.
  - Arquivos/módulos: `src/app/app.routes.ts`, `src/app/features/admin/admin-page/`, `src/app/core/auth/` e novo `src/app/features/admin/media-management/`.
  - Verificação: a gestão de mídia ficará dentro de `/admin`, reutilizará o guard e a sessão existentes, não criará autenticação paralela e não alterará a rota pública.

## Fase 2 — Lógica principal

- [ ] T-006 [FR-001, FR-002, FR-008] Implementar validações de imagem, currículo, locale, projeto e registro alvo.
  - Arquivos/módulos: `src/app/features/admin/media-management/` e modelos compartilhados de conteúdo.
  - Verificação: PNG/JPG/JPEG até 1 MB são aceitos para imagens; somente `application/pdf` e locales `pt-BR`/`en` são aceitos para currículos; projeto inexistente, registro inexistente e arquivos inválidos retornam erro sem chamada de persistência.

- [ ] T-007 [FR-001, FR-003, FR-004] Implementar o upload de uma nova imagem para um projeto existente.
  - Arquivos/módulos: serviço em `src/app/features/admin/media-management/`, cliente em `src/app/core/supabase/` e tipos em `src/app/features/portfolio/content/`.
  - Verificação: o arquivo é enviado ao bucket `project-images` em caminho único, a referência e os metadados são inseridos em `portfolio_project_images` e a imagem aparece na leitura pública do projeto correto.

- [ ] T-008 [FR-002, FR-003, FR-004] Implementar o upload de um novo currículo para `pt-BR` ou `en`.
  - Arquivos/módulos: serviço de mídia, `portfolio_files` e bucket `curricula`.
  - Verificação: o PDF é enviado ao bucket correto, a referência é inserida para o locale selecionado, a unicidade `(file_type, locale)` é respeitada e o serviço público consegue gerar a URL correspondente.

- [ ] T-009 [FR-005, FR-007] Implementar a substituição de uma imagem específica sem substituir a galeria inteira.
  - Arquivos/módulos: serviço de mídia, `portfolio_project_images` e modelos de projeto.
  - Verificação: o alvo é o `id` selecionado, o mesmo registro mantém `project_id` e `display_order`, apenas os metadados/referência são atualizados e a página pública usa a nova imagem.

- [ ] T-010 [FR-006, FR-007] Implementar a substituição do currículo corrente por locale.
  - Arquivos/módulos: serviço de mídia e `portfolio_files`.
  - Verificação: a operação atualiza somente o currículo do locale selecionado, preserva a separação entre `pt-BR` e `en`, mantém no máximo um registro corrente e a página pública usa o novo PDF.

- [ ] T-011 [FR-005, FR-006, FR-008] Implementar a remoção do objeto anterior e a limpeza de objeto órfão.
  - Arquivos/módulos: orquestrador de mídia em `src/app/features/admin/media-management/`, Storage e tratamento de erros.
  - Verificação: após substituição confirmada o `storage_path` anterior é removido; se a referência falhar depois do upload, o novo objeto é removido; nenhuma dessas falhas é apresentada como sucesso.

- [ ] T-012 [FR-005, FR-006, FR-008] Implementar a estratégia de consistência e concorrência aprovada no Registro de Decisão.
  - Arquivos/módulos: serviço de mídia, migration/função SQL aprovada e contratos de atualização.
  - Verificação: duas operações concorrentes sobre o mesmo alvo não removem o objeto corrente de outra operação e a última operação confirmada é a associação corrente; o comportamento de falha de remoção segue o ADR.

- [ ] T-013 [FR-007, FR-008] Integrar os resultados do serviço ao contrato de leitura pública sem alterar a apresentação.
  - Arquivos/módulos: `src/app/features/portfolio/content/portfolio-content.service.ts`, modelos existentes e testes da página pública.
  - Verificação: nova associação é lida após recarregar, imagens continuam compartilhadas entre idiomas, o currículo segue o locale selecionado e erro de leitura não gera sucesso falso nem quebra a página.

## Fase 3 — Interface

- [ ] T-014 [FR-001, FR-002, FR-007, FR-008] Adicionar a gestão de mídia ao workspace administrativo protegido.
  - Arquivos/módulos: `src/app/features/admin/admin-page/admin-workspace.ts` e novo `src/app/features/admin/media-management/`.
  - Verificação: Marcos autenticado visualiza a gestão de mídia dentro de `/admin`; visitante e conta não autorizada não visualizam nem executam operações de escrita; o editor de conteúdo existente continua acessível.

- [ ] T-015 [FR-001, FR-003, FR-004, FR-008] Criar o formulário de upload de imagem vinculada a projeto.
  - Arquivos/módulos: `media-management.ts`, `media-management.html`, `media-management.scss`.
  - Verificação: o formulário lista projetos válidos, aceita somente arquivo válido, envia a operação correta e mostra estado de carregamento, sucesso confirmado ou erro identificável.

- [ ] T-016 [FR-005, FR-007, FR-008] Criar o fluxo de seleção e substituição de uma imagem específica.
  - Arquivos/módulos: componentes e modelos de `src/app/features/admin/media-management/`.
  - Verificação: cada imagem existente é identificável por seu registro, a substituição não troca outras imagens da galeria e a interface não confirma sucesso antes da persistência e limpeza exigidas.

- [ ] T-017 [FR-002, FR-006, FR-007, FR-008] Criar os fluxos de upload e substituição de currículo por locale.
  - Arquivos/módulos: componentes de `media-management/` e contratos de `portfolio_files`.
  - Verificação: a interface separa `pt-BR` e `en`, aceita PDF, mostra o arquivo corrente de cada locale e exibe falha sem substituir visualmente o estado confirmado anterior.

- [ ] T-018 [FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Integrar feedback e estados de operação.
  - Arquivos/módulos: `media-management.ts`, template/estilos e serviço de mídia.
  - Verificação: carregamento impede submissões conflitantes no mesmo alvo, sucesso só aparece após todas as etapas obrigatórias, falhas não anunciam publicação e mensagens seguem o padrão administrativo existente.

## Fase 4 — Testes

- [ ] T-019 [FR-001, FR-002, FR-008] Cobrir validações e estados inválidos.
  - Arquivos/módulos: testes em `src/app/features/admin/media-management/`.
  - Verificação: testes cobrem MIME, tamanho, locale, projeto ausente, imagem específica ausente, currículo inválido e nenhuma chamada de persistência para entrada rejeitada.

- [ ] T-020 [FR-001, FR-002, FR-003, FR-004] Cobrir uploads novos e associação de metadados.
  - Arquivos/módulos: testes do serviço de mídia com mocks controlados do Supabase.
  - Verificação: imagem e currículo são enviados ao bucket correto, referências e metadados são persistidos no registro correto e a URL pública gerada corresponde ao caminho salvo.

- [ ] T-021 [FR-005, FR-006, FR-007, FR-008] Cobrir substituição, remoção do anterior e limpeza de órfão.
  - Arquivos/módulos: testes do orquestrador/serviço de mídia.
  - Verificação: imagem específica e currículo por locale são substituídos; objeto anterior é removido; falha de persistência remove o novo objeto; falha não produz falso sucesso.

- [ ] T-022 [FR-005, FR-006, FR-008] Cobrir concorrência conforme o Registro de Decisão.
  - Arquivos/módulos: testes do serviço, função SQL se aprovada e fixtures de Storage.
  - Verificação: duas substituições concorrentes do mesmo alvo deixam a última operação confirmada como corrente e não removem o objeto corrente da vencedora.

- [ ] T-023 [FR-003, FR-004, FR-005, FR-006, FR-008] Verificar migration, grants, policies e contratos de arquivo.
  - Arquivos/módulos: `supabase/migrations/`, evidências em `spec/05-verificacao/upload-substituicao-midias/`.
  - Verificação: `anon` lê quando permitido e não escreve/remove; conta autenticada não autorizada não escreve/remove; Marcos insere/atualiza/remove Storage nos buckets permitidos; MIME/tamanho/locale são rejeitados pelo contrato.

- [ ] T-024 [FR-007, FR-008] Executar regressão integrada da aplicação pública e administrativa.
  - Arquivos/módulos: suíte existente de `src/app/core/auth/`, `src/app/features/admin/`, `src/app/features/portfolio/`, build e verificação browser.
  - Verificação: autenticação, `/admin`, gestão de conteúdo, alternância PT/EN, imagens públicas, currículos, projetos e layout continuam funcionando após upload e substituição.

- [ ] T-025 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Conferir convergência antes da entrega.
  - Arquivos/módulos: Spec, ADR, plano, tarefas, código, migrations, testes e evidências.
  - Verificação: cada FR e AC possui tarefa e evidência; riscos e divergências estão registradas; nenhum requisito foi implementado fora da Spec aprovada.

## Fase 5 — Entrega

- [ ] T-026 [FR-003, FR-005, FR-006, FR-008] Documentar aplicação e rollback da migration e das policies.
  - Arquivos/módulos: `spec/05-verificacao/upload-substituicao-midias/`, `spec/06-deploy/upload-substituicao-midias/` e migration versionada.
  - Verificação: documentação descreve ordem de aplicação, validações pós-migration, rollback, tratamento de falhas de Storage e não contém segredo, senha ou `service_role`.

- [ ] T-027 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Validar a operação em ambiente controlado antes da entrega.
  - Arquivos/módulos: ambiente Supabase controlado, aplicação Angular e roteiro de verificação.
  - Verificação: Marcos consegue adicionar/substituir imagem e currículos; a última versão aparece publicamente; arquivo anterior/órfão é removido; visitantes e contas não autorizadas são bloqueados.

- [ ] T-028 [FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008] Submeter Spec, ADR, plano, tarefas, diff e evidências para aprovação de Marcos.
  - Arquivos/módulos: documentação completa da feature e revisão final do repositório.
  - Verificação: Marcos revisa a convergência Spec ↔ plano/tarefas ↔ código ↔ testes e aprova; nenhum deploy é executado antes dessa aprovação.

## Adiado (fora do escopo desta rodada)

- [ ] Exclusão manual avulsa de imagens, currículos, referências ou objetos do Storage.
- [ ] Imagens diferentes por tradução do mesmo projeto.
- [ ] Corte, compressão, redimensionamento, conversão ou processamento de arquivos.
- [ ] Novos idiomas além de `pt-BR` e `en`.
- [ ] Upload por visitantes, múltiplos administradores ou permissões avançadas.
- [ ] Workflow de rascunho, revisão, aprovação ou publicação posterior.
- [ ] Backend próprio, nova tabela de mídia ou novo bucket sem decisão arquitetural aprovada.
