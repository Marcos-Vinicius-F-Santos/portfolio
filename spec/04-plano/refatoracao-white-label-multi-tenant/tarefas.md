# Tarefas — Refatoração White-Label e Isolamento por Perfil

Plano relacionado: [spec/04-plano/refatoracao-white-label-multi-tenant/plano.md](./plano.md)

## Regra das tarefas

Cada tarefa é pequena o suficiente para revisão individual, referencia os requisitos
`FR-XXX` que implementa e informa como verificar que ficou pronta. Esta lista descreve
o trabalho; a implementação só deve começar após a aprovação deste plano e das decisões
abertas do contrato de snapshot.

## Fase 1 — Base

- [ ] T-001 [FR-001, FR-005, FR-008] Inventariar referências pessoais e separar artefatos operacionais de documentos históricos
  - Arquivos/módulos: `scripts/`, `supabase/`, `src/`, `package.json`, workflows de deploy e `spec/`
  - Verificação: produzir uma lista de allowlist/blocklist; a busca identifica todos os nomes, URLs e assets pessoais consumidos por código, build, teste ou deploy.

- [ ] T-002 [FR-003, FR-004] Registrar o contrato aditivo de identidade do perfil e da mídia no `formatVersion: 1`
  - Arquivos/módulos: `editorial-snapshot.models.ts`, validador/adapter, ADR-008 e novo ADR se necessário
  - Verificação: decisão registrada define `profileId`, `mediaId`, runtime config sobrescrevendo snapshot, compatibilidade de `formatVersion: 1` e comportamento para snapshot antigo/inválido.

- [ ] T-003 [FR-003, FR-009] Adicionar as variáveis de configuração genéricas e seus defaults neutros
  - Arquivos/módulos: `scripts/generate-runtime-config.mjs`, `src/app/core/config/supabase-runtime-config.ts`, documentação de ambiente
  - Verificação: a configuração gerada aceita `PORTFOLIO_AUTHOR_NAME`, `PORTFOLIO_PROFILE_ID` e `PORTFOLIO_PROFILE_IMAGE_URL`, não contém segredo e não possui fallback pessoal.

- [ ] T-004 [FR-005, FR-008] Renomear os artefatos operacionais específicos para nomes funcionais
  - Arquivos/módulos: `generate-joao-editorial-snapshot.mjs`, `bundle-editorial-sql.mjs`, SQL, snapshots, fixtures e testes referenciados pelo build/deploy
  - Verificação: todos os imports, comandos e entradas operacionais apontam para caminhos genéricos; referências antigas restantes ficam somente em histórico não consumido.

## Fase 2 — Lógica principal

- [ ] T-005 [FR-002, FR-003, FR-009] Implementar o resolvedor de identidade por instância com precedência do runtime config
  - Arquivos/módulos: `src/app/core/config`, serviços de conteúdo editorial e modelos de perfil
  - Verificação: runtime config sobrescreve o valor equivalente do snapshot; fonte ausente resulta em avatar/texto neutro e nunca em dados de outra instância.

- [ ] T-006 [FR-002, FR-007] Remover contatos, links e biografias pessoais dos defaults compartilhados
  - Arquivos/módulos: `src/app/features/portfolio/services/portfolio-content.ts`, `contact-panel.models.ts` e fixtures relacionadas
  - Verificação: canais ausentes não geram links clicáveis; busca e testes não encontram e-mail, telefone, LinkedIn, GitHub ou biografia pessoal em defaults executáveis.

- [ ] T-007 [FR-003, FR-004, FR-009] Adicionar suporte ao perfil e à imagem gerenciada no snapshot/adapter
  - Arquivos/módulos: `editorial-snapshot.models.ts`, validator, `editorial-snapshot-adapter.ts`, serviço de snapshot publicado e resolução de mídia
  - Verificação: snapshot válido resolve `mediaId` no Storage; `profileId` incompatível, mídia ausente ou URL inválida são rejeitados/neutralizados conforme a decisão aprovada.

- [ ] T-008 [FR-005, FR-006, FR-008] Parametrizar os geradores de snapshot, seed e bundle SQL
  - Arquivos/módulos: scripts de geração, snapshot inicial, `supabase/` e comandos do `package.json`
  - Verificação: uma entrada de perfil genérica gera saída completa sem nome próprio no caminho; campos obrigatórios ausentes interrompem a geração com erro explícito.

- [ ] T-009 [FR-009] Preservar isolamento por Supabase separado
  - Arquivos/módulos: configuração de cliente Supabase, carregamento de snapshot e documentação de ambiente/deploy
  - Verificação: duas configurações de projeto Supabase não compartilham dados, não usam tenant global e não carregam cache/fallback residual da outra instância.

## Fase 3 — Interface

- [ ] T-010 [FR-002, FR-004, FR-010] Fazer o hero consumir a imagem resolvida e aplicar o avatar genérico versionado
  - Arquivos/módulos: `portfolio-page.component.ts`, `.html`, `.css`, assets neutros
  - Verificação: o template não referencia imagem com nome de pessoa; imagem publicada aparece, falha de carregamento troca para o asset genérico versionado e o layout atual permanece navegável.

- [ ] T-011 [FR-005, FR-010] Atualizar a experiência pública e administrativa para os caminhos genéricos
  - Arquivos/módulos: referências de template, serviços, admin de mídia/conteúdo e textos operacionais
  - Verificação: navegação, idiomas, projetos, galeria, painel de contato e autenticação administrativa continuam funcionando sem depender de nomes antigos.

## Fase 4 — Testes

- [ ] T-012 [FR-002, FR-003, FR-007] Cobrir configuração, contatos ausentes e fallback neutro
  - Arquivos/módulos: specs de `runtime-config`, portfolio page/content e contact panel
  - Verificação: testes passam para configuração completa, configuração vazia e canais ausentes; nenhuma expectativa contém identidade real.

- [ ] T-013 [FR-003, FR-004, FR-009] Cobrir snapshot, mídia publicada e incompatibilidade de perfil
  - Arquivos/módulos: specs do modelo/adapter/snapshot publicado e fixtures editoriais
  - Verificação: testes cobrem mídia válida, mídia ausente, URL quebrada, `profileId` incompatível e snapshot legado sem vazamento.

- [ ] T-014 [FR-001, FR-005, FR-008] Criar o gate automatizado de referências operacionais pessoais
  - Arquivos/módulos: script de verificação, `package.json`/CI, `scripts/`, `src/`, `supabase/` e assets empacotados
  - Verificação: o gate falha diante de uma referência pessoal executável e passa quando nomes históricos estão restritos a documentos não consumidos.

- [ ] T-015 [FR-009, FR-010] Executar verificação de isolamento e regressão de fluxo
  - Arquivos/módulos: fixtures de duas instâncias, testes de integração e verificação visual/browser
  - Verificação: `npm test`/suíte equivalente, `npm run build` e smoke test confirmam página pública, idioma, projetos, contato e admin sem dados cruzados.

## Fase 5 — Entrega

- [ ] T-016 [FR-005, FR-008] Executar a migração operacional em um único commit
  - Arquivos/módulos: todos os arquivos renomeados, scripts, SQL, snapshots, testes e referências de build/deploy
  - Verificação: revisar `git diff --check`, status, lista de caminhos antigos e diff completo; não usar reset, checkout destrutivo ou compatibilidade temporária.

- [ ] T-017 [FR-003, FR-004, FR-009] Configurar Storage individual, runtime env e snapshot por instância
  - Arquivos/módulos: Supabase Storage/policies, `.env` local e variáveis de deploy, artefato de snapshot
  - Verificação: cada instância lê sua própria imagem no Storage do seu Supabase; runtime config sobrescreve o snapshot; nenhuma chave secreta chega ao frontend; avatar genérico versionado funciona quando a mídia está indisponível.

- [ ] T-018 [FR-010] Documentar e ensaiar rollback pós-deploy
  - Arquivos/módulos: procedimento operacional de deploy/rollback, snapshot anterior, configuração e Storage
  - Verificação: é possível restaurar o bundle/snapshot anterior sem apagar objetos do Storage e a aplicação volta a renderizar fallback neutro ou o conteúdo anterior.

## Adiado (fora do escopo desta rodada)

- [ ] Criar um banco Supabase compartilhado com isolamento por `profile_id`/tenant.
- [ ] Remover referências pessoais de specs, changelogs e documentos históricos não consumidos.
- [ ] Criar um novo sistema de autenticação ou múltiplos administradores.
