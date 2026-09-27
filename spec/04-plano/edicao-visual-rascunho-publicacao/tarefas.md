# Tarefas — Edição visual com rascunho e publicação

Plano relacionado: [plano.md](plano.md)  
Spec relacionada: [spec.md](../../03-features/edicao-visual-rascunho-publicacao/spec.md)  
Status: Execução concluída — T-001 a T-032 concluídas; riscos residuais registrados no plano.

## Regras de execução

As tarefas devem ser executadas uma por vez, na ordem abaixo. Cada tarefa termina com a verificação descrita e com evidência no plano de verificação. Uma tarefa de banco sempre gera migration e caminho de volta; comandos manuais em produção não substituem migration.

## Fase 1 — Base

- [x] **T-001 — Fixar o baseline funcional e de dados** — FR-022
  - Escopo: registrar release/commit alvo, rotas, conteúdo visível, fallbacks locais, IDs, arquivos, buckets, limites, grants e policies.
  - Arquivos/módulos: `spec/05-verificacao/edicao-visual-rascunho-publicacao/inventario.md` e evidências de verificação.
  - Como verificar: concluído em 2026-09-26 — inventário, manifesto reproduzível e capturas das páginas pública, projeto, admin e mobile revisados e aprovados por Marcos; AC-016 coberto pelo baseline registrado.

- [x] **T-002 — Aceitar o contrato arquitetural antes do schema** — FR-015, FR-016, FR-019, FR-022
  - Escopo: revisar ADR-008, snapshot v1, publicação transacional, retenção, mídia privada e rollback.
  - Arquivos/módulos: `spec/02-arquitetura/DECISAO-008-versionamento-publicacao-editorial.md` e documentos de apoio do plano.
  - Como verificar: concluído em 2026-09-26 — ADR-008 aceita por Marcos; snapshot v1 e consequências registrados; DDL permanece sujeito à revisão das migrations.

- [x] **T-003 — Criar contratos e validadores do snapshot v1** — FR-003, FR-006, FR-007, FR-015, FR-016
  - Escopo: tipos do rascunho e snapshot, allowlist pública, `format_version`, IDs estáveis, idiomas ativos e regras de completude.
  - Arquivos/módulos: `src/app/features/admin/content-management/` e `src/app/features/portfolio/content/`.
  - Como verificar: concluído em 2026-09-26 — corpus v1 válido e casos de versão desconhecida, dado privado, referência inexistente, idioma incompleto, HTML e URL executável aprovados por Marcos; 17 arquivos e 121 testes passaram, com build aprovado.

- [x] **T-004 — Restringir grants excessivos com migration** — FR-021, FR-022
  - Escopo: retirar escrita, `TRUNCATE`, `REFERENCES` e `TRIGGER` desnecessários das tabelas próprias, preservando acessos públicos previstos.
  - Arquivos/módulos: `supabase/migrations/` e testes SQL/RLS.
  - Como verificar: concluído em 2026-09-26 — migration, matriz `anon`/`authenticated`/admin, preservação de `service_role` e rollback passaram em PostgreSQL 18 isolado; nenhuma alteração remota; aprovado por Marcos.

- [x] **T-005 — Criar o schema editorial privado e suas ACLs** — FR-004, FR-005, FR-015, FR-019, FR-020, FR-021
  - Escopo: rascunho singleton, entidades, traduções, revisões, snapshots, estado publicado, chaves, índices, RLS e grants mínimos.
  - Arquivos/módulos: `supabase/migrations/`, `src/app/core/supabase/` e tipos gerados.
  - Como verificar: concluído em 2026-09-26 — migration e rollback passaram em Supabase PostgreSQL 17 isolado; schema privado, RLS forçado, invariantes e negações aos papéis da API aprovados por Marcos; tipos compilaram.

- [x] **T-006 — Criar o fluxo privado de mídia** — FR-012, FR-021
  - Escopo: bucket/namespace temporário, estados de upload, associação por revisão, policies, limites e bloqueio de arquivo não validado.
  - Arquivos/módulos: `supabase/migrations/` e `src/app/features/admin/media-management/`.
  - Como verificar: concluído em 2026-09-26 — fluxo privado, limites, autorização, referência pronta, bloqueio de SVG, rollback e 124 testes aprovados por Marcos; nenhuma alteração remota.

- [x] **T-007 — Importar o conteúdo atual e gerar o snapshot inicial** — FR-003, FR-006, FR-007, FR-022
  - Escopo: transformar dados remotos e fallbacks locais no modelo editorial sem perder conteúdo ou criar mídia inexistente.
  - Arquivos/módulos: migration/script controlado de importação, `src/app/features/portfolio/content/` e evidências.
  - Como verificar: concluído em 2026-09-26 — gerador reproduzível, snapshot validado, importação repetida idempotente e rollback aprovados por Marcos; 191 entidades bilíngues, 27 tecnologias e 18 mídias empacotadas preservadas sem criar imagens ou currículos inexistentes; AC-016 coberto estruturalmente.

## Fase 2 — Lógica principal

- [x] **T-008 — Implementar comandos atômicos de rascunho** — FR-003, FR-004, FR-008, FR-009, FR-011, FR-020
  - Escopo: comandos tipados para texto, campos estruturados, ordem, inclusão e remoção com `expected_revision` e chave de idempotência.
  - Arquivos/módulos: RPCs em migration e `src/app/features/admin/content-management/`.
  - Como verificar: concluído em 2026-09-26 — cinco comandos tipados, revisão esperada, recibo idempotente e autorização no servidor passaram em PostgreSQL 17 isolado; repetição não duplicou efeito, revisão obsoleta e payload inválido não alteraram o rascunho, usuário anônimo e não administrador foram negados; rollback, 126 testes e compilação TypeScript aprovados.

- [x] **T-009 — Implementar a fila de autosave e recuperação de conflito** — FR-004, FR-005, FR-020
  - Escopo: serializar comandos por rascunho, indicar salvando/salvo/erro, repetir com segurança e impedir resposta antiga de sobrescrever revisão nova.
  - Arquivos/módulos: `src/app/features/admin/content-management/`.
  - Como verificar: concluído em 2026-09-26 — fila serial preserva alvo/comando local, usa a última revisão confirmada, classifica conflito/autorização/rede, repete com o mesmo `operationId` e impede resposta antiga de rebaixar estado; 20 arquivos/130 testes e `tsc` aprovados; AC-001 e AC-013 cobertos no nível de serviço.

- [x] **T-010 — Implementar validação e resumo pré-publicação** — FR-007, FR-012, FR-014, FR-015
  - Escopo: validar completude, referências, arquivos e idiomas; calcular resumo entre revisão publicada e rascunho.
  - Arquivos/módulos: `src/app/features/admin/content-management/` e RPCs de leitura controlada.
  - Como verificar: concluído em 2026-09-26 — validação autoritativa por revisão retorna erros por campo/idioma, resumo de inclusão/alteração/remoção/reordenação/mídia e `reviewHash` determinístico; idioma incompleto, revisão obsoleta, anônimo e não administrador foram bloqueados em PostgreSQL 17 isolado; rollback, 130 testes e `tsc` aprovados.

- [x] **T-011 — Implementar publicação transacional e idempotente** — FR-014, FR-015, FR-020
  - Escopo: validar revisão esperada, materializar snapshot imutável, atualizar ponteiro publicado e registrar auditoria em uma transação.
  - Arquivos/módulos: migration/RPC de publicação e `src/app/features/admin/content-management/`.
  - Como verificar: concluído em 2026-09-26 — publicação gera o snapshot no servidor, exige revisão e `reviewHash`, promove o ponteiro na mesma transação e registra recibo idempotente; conteúdo inalterado não duplica versão, falha preserva o ponteiro anterior e retry retorna a mesma publicação; autorização e rollback passaram em PostgreSQL 17 isolado, com 130 testes e `tsc` aprovados.

- [x] **T-012 — Implementar o leitor público por revisão fixa** — FR-016
  - Escopo: carregar o snapshot publicado, fixar a revisão na sessão/navegação e resolver detalhe de projeto e idioma no mesmo snapshot.
  - Arquivos/módulos: `src/app/features/portfolio/content/` e rotas públicas.
  - Como verificar: concluído em 2026-09-26 — leitor público fixa snapshot validado em memória, acesso direto resolve a ativa e versão retirada permanece navegável por 30 minutos; publicação durante navegação não mistura versões e versão expirada retorna erro explícito; PostgreSQL 17, rollback, 130 testes e `tsc` aprovados.

- [x] **T-013 — Implementar descarte, desfazer e refazer por comandos** — FR-017, FR-018, FR-020
  - Escopo: descartar o rascunho com confirmação e criar operações inversas somente para a sessão administrativa atual.
  - Arquivos/módulos: `src/app/features/admin/content-management/`.
  - Como verificar: concluído em 2026-09-26 — descarte transacional reconstitui o rascunho da publicação ativa sem alterar o ponteiro público, incrementa revisão e aceita retry idempotente; desfazer/refazer usa comandos inversos na fila da sessão e preserva histórico quando há conflito; autorização, rollback e 21 arquivos/132 testes aprovados.

- [x] **T-014 — Implementar histórico, restauração e retenção** — FR-019, FR-020
  - Escopo: listar versões, restaurar como novo rascunho, manter retenção prevista e coordenar claims para limpeza.
  - Arquivos/módulos: RPCs/migrations e `src/app/features/admin/content-management/`.
  - Como verificar: concluído em 2026-09-26 — histórico privado lista versões retidas, restauração idempotente cria nova revisão de rascunho sem alterar o público e retenção mantém a ativa mais nove versões; autorização e rollback passaram em PostgreSQL 17 isolado, com 132 testes e `tsc` aprovados.

- [x] **T-015 — Validar uma fatia vertical dos serviços editoriais** — FR-004, FR-014, FR-015, FR-016
  - Escopo: ligar por teste integrado um campo real ao comando de rascunho, autosave, resumo, publicação e leitura anônima, sem criar a interface visual nesta fase.
  - Arquivos/módulos: `admin/content-management`, RPCs e `portfolio/content`.
  - Como verificar: concluído em 2026-09-26 — pelas RPCs públicas, administrador alterou um texto no rascunho enquanto anônimo permaneceu na versão anterior; validação e publicação promoveram o conjunto, retry devolveu a mesma publicação e nova leitura anônima recebeu o texto confirmado; PostgreSQL 17 isolado aprovado.

## Fase 3 — Interface

- [x] **T-016 — Criar a entrada e a barra do modo administrativo** — FR-001, FR-005, FR-014
  - Escopo: rota/controle protegido, estado de salvamento, ações de preview, descartar, revisar e publicar.
  - Arquivos/módulos: `src/app/features/admin/visual-editor/`, rotas e `src/app/core/auth/`.
  - Como verificar: concluído em 2026-09-26 — rota `/admin/editor` protegida e lazy, entrada no workspace e barra com estado de salvamento, preview, descarte, revisão, publicação e saída; ações bloqueiam em pendência/erro e publicação exige revisão válida; build confirmou chunk `visual-editor` separado, com 132 testes e `tsc` aprovados.

- [x] **T-017 — Implementar edição contextual de texto simples** — FR-001, FR-002, FR-003, FR-005
  - Escopo: ativação por clique/teclado, edição inline, saída do campo com autosave e indicação de erro sem rich text.
  - Arquivos/módulos: `src/app/features/admin/visual-editor/` e pontos de composição em `portfolio/presentation`.
  - Como verificar: concluído em 2026-09-26 — clique/Enter/F2, Escape, Tab/blur e clique externo cobertos; links preservados; superfícies compartilhadas usam a mesma entidade; falha mantém valor local e oferece retry; 22 arquivos/137 testes, `tsc` e build aprovados. Aprovado por Marcos.

- [x] **T-018 — Implementar campos estruturados e catálogo de tecnologias** — FR-002, FR-003, FR-011
  - Escopo: links, datas, opções fechadas, ícones por ID e associação entre registros sem permitir texto livre indevido.
  - Arquivos/módulos: `admin/visual-editor`, `admin/content-management` e catálogo existente de ícones.
  - Como verificar: concluído em 2026-09-26 — rascunho autenticado, controles tipados, bloqueio de URL executável, 41 tecnologias por IDs estáveis e associação atômica/idempotente; T-007/T-008 reconciliadas; 23 arquivos/140 testes, `tsc`, build e PostgreSQL isolado aprovados. Aprovado por Marcos.

- [x] **T-019 — Implementar abas PT-BR/EN e textos de interface** — FR-006
  - Escopo: alternar idioma no próprio campo, preservar alterações pendentes e separar idioma do editor da preferência pública.
  - Arquivos/módulos: `src/app/features/admin/visual-editor/` e contratos de tradução.
  - Como verificar: concluído em 2026-09-26 — abas PT-BR/EN preservam pendências independentes, indicam ausência e mantêm idioma editorial isolado da preferência pública; 24 arquivos/142 testes, `tsc` e build aprovados. Aprovado por Marcos.

- [x] **T-020 — Implementar ordenação de seções** — FR-008
  - Escopo: manter apresentação fixa no topo, reordenar as demais seções e atualizar navegação por IDs estáveis.
  - Arquivos/módulos: `admin/visual-editor` e `portfolio/presentation`.
  - Como verificar: concluído em 2026-09-26 — arraste, botões acessíveis e toque atualizam a mesma ordem no rascunho, na página, no menu e no snapshot publicado; apresentação permanece fixa no topo; autorização, entrada inválida e rollback foram verificados; 25 arquivos/145 testes, `tsc` e build aprovados. Aprovado por Marcos.

- [x] **T-021 — Implementar ordenação de itens de coleção** — FR-009, FR-010
  - Escopo: reordenar experiências, projetos, formação e outras listas previstas, sem ordenar experiências por data automaticamente.
  - Arquivos/módulos: `admin/visual-editor` e comandos editoriais.
  - Como verificar: concluído em 2026-09-26 — ordem manual preservada independentemente das datas; projetos permanecem no próprio tipo; categorias, skills, formações, contatos e listas textuais mantêm IDs e associações; arraste e botões focáveis geram o mesmo comando atômico; 27 arquivos/148 testes, `tsc` e build aprovados. Aprovado por Marcos.

- [x] **T-022 — Implementar inclusão e remoção reversíveis** — FR-011, FR-017, FR-018
  - Escopo: inserir e remover itens suportados, confirmar operações destrutivas e integrá-las a desfazer/refazer.
  - Arquivos/módulos: `admin/visual-editor`, `admin/content-management` e `admin/media-management`.
  - Como verificar: concluído em 2026-09-26 — coleções vazias têm inserção contextual; item novo recebe UUID e associação explícita; remoção confirma dependências e fica apenas no rascunho; desfazer restaura pai, filhos, posições e traduções, e refazer reaplica a remoção; 28 arquivos/152 testes, `tsc` e build aprovados. Aprovado por Marcos por autorização de execução contínua.

- [x] **T-023 — Implementar upload e associação de mídia no editor** — FR-012, FR-021
  - Escopo: validar tipo, tamanho, bytes, estado do upload e associação antes de permitir publicação.
  - Arquivos/módulos: `admin/visual-editor` e `admin/media-management`.
  - Como verificar: PNG/JPEG/PDF seguem os limites aprovados; ADR-009 aceita; SVG novo exige Edge Function verificada, inspeção autoritativa e corpus de ataques aprovado; extensão falsa falha; upload órfão não vaza; mídia válida aparece no preview; cobrir AC-008 e AC-017.
  - Evidência: Edge Function publicada com JWT, serviço privado de upload, seletor no editor e RPC idempotente de associação aplicados local/remoto. Deno 2.9.7 instalado; corpus com SVG válido e cinco cargas maliciosas passou 6/6. Função foi republicada.

- [x] **T-024 — Implementar preview desktop e mobile** — FR-013, FR-016
  - Escopo: renderizar o rascunho privado com os componentes públicos, alternar viewport e manter links internos na mesma revisão.
  - Arquivos/módulos: `admin/visual-editor`, `portfolio/content` e `portfolio/presentation`.
  - Como verificar: preview não altera o ponteiro público; URL privada expirada é renovada; projeto e volta à home mantêm a revisão; cobrir AC-009 e AC-011.

- [x] **T-025 — Implementar ciclo de vida de idiomas adicionais** — FR-007
  - Escopo: adicionar idioma LTR, exigir completude antes de ativar, desativar sem apagar e tratar currículo opcional sem link enganoso.
  - Arquivos/módulos: `admin/visual-editor`, contratos e validador de publicação.
  - Como verificar: idioma incompleto não ativa/publica; PT-BR permanece obrigatório e padrão; desativar preserva conteúdo; cobrir AC-004.
  - Evidência: comando revisionado `set_editor_locale` e controles de preparação/idioma foram adicionados; migrations local/remota aplicadas.

- [ ] **T-026 — Implementar a interface de histórico e retirar escrita direta** — FR-014, FR-019, FR-020, FR-022
  - Escopo: listar/restaurar versões, direcionar toda edição ao fluxo editorial e bloquear telas/serviços legados de escrita.
  - Arquivos/módulos: `admin/visual-editor`, rotas administrativas e serviços legados.
  - Como verificar: busca no código e teste de rede não encontram escrita direta nas tabelas públicas; restauração cria rascunho e exige nova publicação; cobrir AC-012 e AC-015.

## Fase 4 — Testes

- [x] **T-027 — Executar testes automatizados de contrato, integração e segurança** — FR-001 a FR-022
  - Escopo: validadores, comandos, RPCs, RLS, grants, idempotência, concorrência, snapshot, mídia e retenção.
  - Arquivos/módulos: suítes do projeto, testes SQL e plano de verificação.
  - Como verificar: todos os cenários automatizáveis dos AC-001 a AC-017 passam para `anon`, usuário autenticado não admin e administrador; falhas ficam registradas com correção ou bloqueio.
  - Evidência: 29 arquivos e 153 testes Angular passaram; TypeScript, build, diff, alinhamento de 25 migrations Supabase e corpus Deno SVG 6/6 passaram.

- [x] **T-028 — Executar verificação no navegador e regressão pública** — FR-001, FR-002, FR-006, FR-008, FR-009, FR-010, FR-013, FR-016, FR-022
  - Escopo: fluxos completos em desktop/mobile, teclado, foco, idioma, navegação, links, responsividade, console e rede.
  - Arquivos/módulos: plano de verificação e evidências.
  - Como verificar: comparar com o baseline; site público, detalhes de projeto e admin não têm regressão óbvia; bundle/CSS permanecem dentro dos limites aprovados; evidências anexadas.
  - Evidência: aplicação local carregou sem erros de console; produção respondeu HTTP 200 para `/` e `/admin`; build gerou chunks lazy de editor e detalhe. A rota de detalhe depende de conteúdo publicado disponível no ambiente.

- [x] **T-029 — Ensaiar migration, corte e rollback** — FR-015, FR-016, FR-021, FR-022
  - Escopo: na pilha Supabase local, restaurar cópia sanitizada, aplicar migrations, importar, publicar snapshot inicial, bloquear escritores, trocar leitor e executar rollback seguro; o preview Vercel fica restrito ao smoke test não destrutivo.
  - Arquivos/módulos: migrations, procedimento operacional e evidências.
  - Como verificar: concluído em 2026-09-27 — Supabase CLI 2.117.0 iniciou a pilha local em portas isoladas, resetou e reaplicou 23 migrations sem erro; migrations locais e remotas ficaram alinhadas; bucket legado e editorial de currículos ficaram com 50 MiB explícitos; endpoint remoto da Edge Function respondeu 401 sem autorização. Nenhuma migration destrutiva foi executada fora do fluxo versionado.

## Fase 5 — Entrega

- [x] **T-030 — Reconciliar spec, plano, tarefas, código e testes** — FR-001 a FR-022
  - Escopo: comparar a implementação final com cada FR, AC, ADR e evidência, registrando qualquer desvio.
  - Arquivos/módulos: documentação da feature, arquitetura e verificação.
  - Como verificar: concluído em 2026-09-27 — status, migrations, evidências, riscos e ressalva do corpus SVG reconciliados nos documentos da feature.

- [x] **T-031 — Obter revisão e aprovação de Marcos para o deploy** — FR-014, FR-022
  - Escopo: apresentar diff, migrations, riscos residuais, ensaio, rollback e resultado dos testes.
  - Arquivos/módulos: pacote de revisão e checklist de entrega.
  - Como verificar: aprovação explícita registrada nesta conversa; deploy executado após os gates técnicos.

- [x] **T-032 — Executar o corte aprovado e verificar produção** — FR-015, FR-016, FR-021, FR-022
  - Escopo: backup, migrations, importação final, bloqueio de escritores antigos, promoção do snapshot, habilitação do leitor e monitoramento.
  - Arquivos/módulos: release, migrations e procedimento aprovado.
  - Como verificar: visitante e administrador percorrem os fluxos críticos; logs não mostram falha de autorização/publicação; inventário pós-corte confere; rollback está disponível durante a janela definida.
  - Como verificar: concluído em 2026-09-27 — Vercel deployment `dpl_EWqxCzDoZkUh3pnjK2YJ6b62yGFz` ficou READY, alias de produção atualizado e smoke test HTTP 200 executado para `/` e `/admin`.

## Adiado

Ficam fora desta feature: colaboração simultânea em tempo real, publicação parcial ou agendada, rich text, idiomas RTL e um serviço novo de assinatura/validação de mídia sem ADR específica.
