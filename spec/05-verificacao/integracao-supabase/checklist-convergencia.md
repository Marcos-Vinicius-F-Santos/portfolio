# Checklist de Convergência — Integração com Supabase

Status: Revisão concluída — deploy não aprovado  
Data: 2026-09-23  
Spec: `spec/03-features/integracao-supabase/spec.md`  
Plano: `spec/04-plano/integracao-supabase/plano.md`  
Tarefas: `spec/04-plano/integracao-supabase/tarefas.md`  
Projeto Supabase: `portfolio-profissional` (`jjndvtjhxutuerwvjocy`)

## Resultado

A implementação converge com a arquitetura, o modelo de dados aprovado, as policies,
o cliente de leitura e os testes automatizados. As ressalvas abaixo são principalmente
de escopo: esta rodada não cria fluxos de escrita no frontend nem seed de conteúdo real.

## Rastreio Spec ↔ Plano/Tarefas ↔ Código ↔ Testes

| Requisito | Código/evidência | Teste/verificação | Status |
|---|---|---|---|
| FR-001 — integração configurada | `src/app/core/config/`, `src/app/core/supabase/`, `app.config.ts` | Build aprovado; ausência de configuração coberta por teste | Confirmado |
| FR-002 — textos | `portfolio_texts` e `portfolio_text_translations`; `loadCopy()` | Fixture de tradução e migration verificadas | Confirmado para schema/leitura; escrita frontend é futura |
| FR-003 — experiências | `portfolio_experiences` e traduções; `listExperiences()` | Serviço e migration verificados | Confirmado para schema/leitura |
| FR-004 — projetos | `portfolio_projects` e traduções; `listProjects()` | Serviço, migration e relação com imagens verificados | Confirmado para schema/leitura |
| FR-005 — PT/EN | filtro por `locale` no serviço | Teste de tradução e regressão do switch | Confirmado no serviço; leitura remota end-to-end sem seed |
| FR-006 — imagens | Storage `project-images`, metadados e `project_id` | Teste de relação 1:N e inspeção do bucket | Confirmado |
| FR-007 — arquivos | Storage `curricula`, `portfolio_files`, `getCurriculum()` | Serviço e migration verificados | Confirmado para schema/leitura |
| FR-008 — migrations | `supabase/migrations/` | Duas migrations registradas no projeto remoto | Confirmado |
| FR-009 — segurança | RLS, policies `auth.uid()`, ACLs mínimos e allowlist | Advisors, leitura `anon`, escrita admin transacional e escrita `anon` negada | Confirmado |
| FR-010 — GET público | Página usa serviço; não há chamada Supabase em componente | Leitura como `anon` e suíte da página | Confirmado sem conteúdo real persistido |
| FR-011 — imagens de projeto | MIME e limite no bucket e na tabela | Bucket verificado; tentativa SQL acima de 1 MB rejeitada | Confirmado para regras de persistência; upload HTTP não executado |

## Critérios de aceite

- [ ] AC-001 — não totalmente confirmado: não existe fluxo `POST`/`UPDATE` no frontend
  nem seed de conteúdo real. Isso é deliberado e está no fora de escopo da própria Spec;
  a migration e os serviços de consulta estão prontos para a feature administrativa futura.
- [x] AC-002 — falha identificável: erro de rede foi coberto por mock, a escrita `anon`
  foi negada e a aplicação mantém fallback local quando não há configuração.
- [x] AC-003 — leitura pública: consulta transacional como `anon` retornou sem autenticação.
  A tabela está vazia porque não houve seed nesta rodada.
- [x] AC-004 — escrita restrita: tentativa de `INSERT` como `anon` foi rejeitada por
  privilégio/RLS; escrita transacional como o usuário administrador foi aceita e revertida.
- [ ] AC-005 — não totalmente confirmado end-to-end: a seleção de locale foi testada com
  fixtures e a alternância local passou, mas não há dados remotos PT/EN persistidos para
  validar a página contra o ambiente Supabase.
- [ ] AC-006 — não totalmente confirmado via upload HTTP: o bucket restringe MIME/tamanho
  e a constraint rejeitou 1.048.577 bytes em transação reversível, mas não foi executado
  upload real pelo Storage API.

## Prioridade alta do plano de verificação

- [x] FR-001 a FR-011 tiveram implementação ou verificação correspondente registrada.
- [x] RLS e policies foram inspecionados; todas as tabelas de portfólio têm RLS.
- [x] `anon` lê e não escreve; o administrador configurado passa pela policy de escrita.
- [x] Storage tem buckets separados e regras de imagem verificadas.
- [x] Advisors de segurança não apontam falha de RLS/Storage; existe um aviso separado
  sobre a proteção contra senhas comprometidas estar desativada.
- [ ] Fluxo público com conteúdo remoto real, switch remoto PT/EN e upload HTTP inválido
  ainda não foram executados porque não há seed nem UI administrativa nesta rodada.

## Arquitetura e regressão

- [x] O código respeita `src/app/core/`, `src/app/features/portfolio/content/` e
  `supabase/migrations/` conforme `ARQUITETURA.md`.
- [x] Componentes não acessam o Supabase diretamente; a página usa `PortfolioContentService`.
- [x] Não foram criados backend próprio, telas administrativas, fluxos de escrita ou novas
  rotas públicas, todos fora do escopo desta rodada.
- [x] Regressão automatizada: 7 arquivos e 58 testes aprovados.
- [x] `npm run build` concluído.
- [x] Não há indício de regressão na alternância de idioma, navegação, IDs ou layout.
- [x] Nenhum segredo, `service_role` ou chave privada foi versionado.
- [ ] Lint não pôde ser confirmado: o projeto não possui script `lint` configurado.

## Migrations, rollback e entrega

- [x] Migration inicial aplicada e conferida no projeto remoto.
- [x] Migration complementar de privilégios aplicada sem editar a migration anterior.
- [x] Rollback/compensação documentado em `migration-rollback.md`.
- [x] Usuário administrador criado no Supabase Auth e vinculado a `portfolio_admins`.
- [ ] Proteção contra senhas comprometidas no Auth permanece desativada, conforme advisor.
- [x] Nenhum deploy foi executado.
- [ ] Deploy não aprovado — depende da decisão de Marcos.

## Divergências e decisões conscientes

1. O texto da Spec usa verbos de persistência, mas a mesma Spec coloca `POST`/`UPDATE`
   fora do escopo; o código implementa schema, policies e leitura, não escrita no frontend.
2. Não há seed de conteúdo real; por isso a leitura pública do ambiente retorna vazio e a
   página usa fallback local. Isso foi aprovado no plano.
3. A validação de arquivo inválido foi confirmada na tabela/bucket e em transação SQL,
   mas não por um upload HTTP real.
4. O advisor atual recomenda habilitar proteção contra senhas comprometidas. Essa
   configuração não foi alterada automaticamente e deve ser decidida antes do deploy.

## Decisão do portão

- [x] Convergência técnica revisada.
- [x] Tarefas T-001 a T-019 marcadas como concluídas conforme solicitação de Marcos.
- [ ] Deploy aprovado — permanece pendente de decisão de Marcos.
