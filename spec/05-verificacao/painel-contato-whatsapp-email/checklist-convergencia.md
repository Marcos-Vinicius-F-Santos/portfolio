# Checklist de Convergência — Painel de contato por WhatsApp e e-mail

Status: Revisão concluída — deploy não aprovado por este checklist
Data: 2026-10-07

Spec relacionada: `spec/03-features/painel-contato-whatsapp-email/spec.md`
Plano relacionado: `spec/04-plano/painel-contato-whatsapp-email/plano.md`
Tarefas relacionadas: `spec/04-plano/painel-contato-whatsapp-email/tarefas.md`
Deploy relacionado: `spec/06-deploy/painel-contato-whatsapp-email/deploy.md`

## Resumo da revisão

A revisão comparou a Spec da Feature, o plano/tarefas, o código em `src/` e os testes.
O comportamento funcional converge com os requisitos: o painel é local e não
persistente, prepara destinos WhatsApp e `mailto:`, mantém os links existentes e usa o
conteúdo localizado já editável do portfólio.

Foram executados 36 arquivos de teste, totalizando 172 testes aprovados, além do build
de produção e `git diff --check`. A revisão visual desktop confirmou a ordem dos links,
painel e currículo, sem sobreposição ou corte observável. A emulação de viewport móvel
não esteve disponível no navegador de revisão; as regras `@media (max-width: 540px)` e a
estrutura responsiva foram conferidas, mas não há evidência visual móvel independente.

## Rastreio Spec ↔ Plano/Tarefas ↔ Código ↔ Testes

| Requisito | Código/evidência | Teste/verificação | Status |
|---|---|---|---|
| FR-001 — painel com campos e ações | `src/app/features/portfolio/presentation/contact-panel/` e integração em `portfolio-page.html` | `contact-panel.spec.ts`, `portfolio-page.spec.ts`, DOM e revisão visual | Confirmado |
| FR-002 — validação dos campos | `validateContactPanelValue()` e estados `aria-invalid`/`role="alert"` | `contact-panel.spec.ts`, `contact-channel-url.spec.ts` | Confirmado |
| FR-003 — destino WhatsApp codificado | `createWhatsAppUrl()` e `window.open(..., '_blank', ...)` | testes de URL e componente com Unicode, quebras e caracteres reservados | Confirmado |
| FR-004 — destino e-mail codificado | `createEmailUrl()` com `URLSearchParams` | testes de URL e componente com assunto e corpo | Confirmado |
| FR-005 — sem envio automático ou persistência | componente só valida, monta URL e abre canal externo | testes de componente; nenhuma chamada de Supabase/API/fila no fluxo | Confirmado |
| FR-006 — conteúdo bilíngue | `PortfolioCopy`, `ENGLISH_COPY`, `copy()` e `ContactPanel` | `portfolio-page.spec.ts` e fallback de conteúdo | Confirmado |
| FR-007 — acessibilidade e responsividade | labels associados, `aria-describedby`, `role="alert"`, CSS responsivo | DOM, build e inspeção visual desktop; viewport móvel ressalvada | Parcialmente confirmado |
| FR-008 — preservação dos links diretos | `contactLinks()` e bloco de currículo mantidos | `portfolio-page.spec.ts` e revisão visual | Confirmado |
| FR-009 — edição localizada | chaves incluídas em `ORIGINAL_COPY`/`ENGLISH_COPY` e `PORTFOLIO_EDITABLE_COPY_KEYS` | `admin-content.service.spec.ts`, `content-management.spec.ts` e inspeção do fluxo genérico | Confirmado com ressalva de não execução contra Supabase real |

## Critérios de aceite

- [x] AC-001 — painel renderizado sem remover os links de LinkedIn, GitHub, e-mail,
      telefone e currículo.
- [x] AC-002 — WhatsApp abre destino codificado com nome, e-mail e mensagem.
- [x] AC-003 — e-mail abre `mailto:` com destinatário, assunto e corpo codificados.
- [x] AC-004 — dados inválidos impedem a abertura e exibem erros identificáveis.
- [ ] AC-005 — textos bilíngues confirmados; responsividade móvel visual independente
      não pôde ser capturada nesta revisão.
- [x] AC-006 — fluxo não grava no Supabase, não chama backend próprio e não usa fila.
- [x] AC-007 — chaves do painel seguem o mecanismo existente de edição separada por idioma.

## Requisitos

- [x] Todo comportamento implementado corresponde à Spec ou está registrado como
      decisão consciente abaixo.
- [x] O critério de aceite descreve o comportamento final observado, com a ressalva
      explícita de viewport móvel em AC-005.

## Arquitetura

- [x] A estrutura respeita `spec/02-arquitetura/ARQUITETURA.md`.
      O componente permanece local em `features/portfolio/presentation/contact-panel/`.
- [x] Nenhum limite arquitetural foi cruzado: não há backend novo, fila, migration,
      alteração de Supabase ou persistência de dados do visitante.

## Dados

- [x] Migration não aplicável; não houve mudança de schema, policy, Auth ou Storage.
- [x] O rollback da feature é frontend e está descrito em
      `spec/06-deploy/painel-contato-whatsapp-email/deploy.md`.

## Testes

- [x] Requisitos de alta prioridade foram cobertos por testes focados e de integração.
- [x] Regressão verificada: 36 arquivos e 172 testes aprovados.
- [x] Build de produção aprovado.
- [x] `git diff --check` aprovado.
- [ ] Lint separado não foi executado porque o projeto não possui script `lint`.
- [ ] Teste visual móvel com viewport independente não foi capturado.

## Entrega

- [x] O procedimento de deploy corresponde ao fluxo real da Vercel e foi criado para
      esta feature.
- [x] O rollback contém sequência operacional para selecionar e restaurar um
      deployment Production `Ready` conhecido como bom.
- [ ] Preview real ainda não foi criado ou validado.
- [ ] O diff ainda não foi commitado/enviado ao remoto nesta revisão.
- [ ] Deploy não foi executado nem aprovado por este checklist.

## Divergências e ressalvas

1. A verificação visual móvel não pôde usar uma emulação de viewport independente no
   navegador disponível. A implementação possui regras responsivas específicas para
   largura máxima de 540px, e os testes/build passaram, mas a evidência visual móvel
   continua pendente para a revisão final de Marcos.
2. A edição por idioma foi verificada pelo catálogo de chaves, pelo caminho genérico de
   `saveCopy()` e pelos testes do editor. Não foi executada uma gravação contra o
   projeto Supabase real nesta revisão.
3. WhatsApp e e-mail são destinos públicos reutilizados do contato existente e ficam
   em uma constante de configuração pública local; não são segredos e nenhuma variável
   nova foi criada. Isso é compatível com a regra de não expor credenciais.
4. O build registra apenas avisos conhecidos de orçamento e o aviso `NG0913` de imagem
   superdimensionada; nenhum deles é erro fatal do fluxo de contato.

## Decisão do portão

- [x] Convergência funcional confirmada para FR-001 a FR-006 e FR-008.
- [ ] AC-005/FR-007 aguardam a revisão visual móvel independente.
- [ ] Deploy aprovado — decisão permanece com Marcos.
- [ ] Preview e promoção para Production executados — não executados.
