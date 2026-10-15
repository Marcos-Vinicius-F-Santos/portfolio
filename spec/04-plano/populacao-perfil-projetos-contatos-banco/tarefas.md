# Tarefas — Ativação de Foto de Perfil, Projetos e Contatos via White-Label e Banco de Dados

Spec relacionada: [spec/03-features/populacao-perfil-projetos-contatos-banco/spec.md](../../03-features/populacao-perfil-projetos-contatos-banco/spec.md)

## Regra das tarefas

Cada tarefa é incremental, referencia os requisitos `FR-XXX` implementados e estabelece o critério exato de verificação. A execução só deve iniciar após a confirmação e aprovação de João Vitor.

---

## Fase 1 — Foto de Perfil via White-Label (Imediato)

- [x] T-001 [FR-001] Copiar a foto de perfil da área de trabalho para asset neutro público
  - Origem: `C:\Users\xjoao\Desktop\linkedin.jpg`
  - Destino: `public/profile.jpg`
  - Verificação: Arquivo existe em `public/profile.jpg` com 22 kB; `node scripts/check-white-label-references.mjs` continua passando sem erros.

- [x] T-002 [FR-001] Configurar `PORTFOLIO_PROFILE_IMAGE_URL` no `.env`
  - Arquivo: `.env`
  - Adição: `PORTFOLIO_PROFILE_IMAGE_URL=/profile.jpg`
  - Verificação: Executar `node scripts/generate-runtime-config.mjs` e constatar que `profileImageUrl: "/profile.jpg"` foi injetado em `public/runtime-config.js`.

---

## Fase 2 — Preparação e Geração da Carga do Banco de Dados

- [x] T-003 [FR-002] Montar o snapshot completo da instância de João Vitor atualizado com a entidade `profile`
  - Arquivo de saída: `spec/05-verificacao/joao-vitor/snapshot-joao-v1.json`
  - Conteúdo: 4 contatos (LinkedIn, GitHub, E-mail, Telefone), 2 projetos (Russian Mastery, Boxe CV), entidade `profile`, tecnologias e traduções completas.
  - Verificação: Validação sintática do JSON contra o schema de `EditorialSnapshotV1`.

- [x] T-004 [FR-002] Gerar script SQL de carga completo para o Supabase
  - Script gerador: `scripts/bundle-editorial-sql.mjs` com input parametrizado
  - Arquivo de saída: `spec/05-verificacao/joao-vitor/setup_joao_vitor.sql`
  - Verificação: O arquivo SQL gerado contém as tabelas, os 4 buckets (`project-images`, `skill-icons`, `curricula`, `editorial-profile-images`), RLS policies e o payload publicado com os contatos e projetos de João Vitor.

---

## Fase 3 — Resiliência e Conexão com o Supabase

- [ ] T-005 [FR-002, FR-003, FR-004] Orientar e acompanhar a reativação do projeto Supabase
  - Ação: João Vitor acessa o dashboard do Supabase (`https://supabase.com/dashboard/project/efxcpncyzqtfaewdbaar`), clica em "Restore Project" / "Resume" e executa o SQL `spec/05-verificacao/joao-vitor/setup_joao_vitor.sql` no SQL Editor.
  - Verificação: Conexão via API responde com sucesso (status 200) e `get_published_snapshot()` retorna o snapshot com os 4 contatos e 2 projetos.

- [x] T-006 [FR-005] Implementar suporte a snapshot local de bootstrap na inicialização
  - Arquivo: `src/app/features/portfolio/services/published-snapshot.service.ts`
  - Lógica: Caso a chamada ao Supabase falhe (ex: projeto pausado ou rede instável), carregar opcionalmente o snapshot publicado localmente se configurado, garantindo resiliência sem violar o white-label.
  - Verificação: Quando Supabase estiver desconectado, a página pública continua renderizando a vitrine de projetos e botões de contato.

---

## Fase 4 — Verificação e Qualidade

- [x] T-007 [FR-001, FR-005] Executar gate automatizado white-label
  - Comando: `node scripts/check-white-label-references.mjs`
  - Verificação: Código de retorno 0 ("White-label reference gate passed.").

- [x] T-008 [FR-003, FR-004] Executar suíte completa de testes unitários
  - Comando: `npm test`
  - Verificação: 100% dos testes passando (180/180 testes aprovados).

- [x] T-009 Executar build de produção
  - Comando: `npm run build`
  - Verificação: Build concluído com sucesso.

- [ ] T-010 Revisão e validação visual de João Vitor
  - Verificação: Foto visível no Hero, 4 botões de contato na seção Contact, 2 cards de projeto em Portfolio.
