# Checklist de convergência — Upload e substituição de imagens e currículos

**Status da revisão:** convergência parcial; deploy não aprovado.

**Data da revisão:** 2026-09-25.

**Escopo revisado:** Spec da Feature, plano, tarefas, Registro de Decisão 005, código,
testes automatizados, migration, rollback e procedimento de deploy.

## Resumo

O objetivo principal está refletido no código: a área administrativa possui fluxos para
upload e substituição de imagens de projetos e currículos, usando os buckets e tabelas já
definidos. A estrutura permanece dentro da arquitetura e não foi criado backend próprio,
rota pública, tabela nova ou bucket novo.

A suíte automatizada passou com 15 arquivos e 107 testes. O build passou. A verificação
visual confirmou a página pública e confirmou que `/admin` continua exigindo autenticação.

A convergência completa não pode ser confirmada porque a migration não foi aplicada em um
Supabase controlado, as policies não foram testadas com `anon`, conta não autorizada e
Marcos, não houve fluxo end-to-end autorizado e o código trata a remoção do objeto
anterior como melhor esforço: após três falhas, mantém a nova referência e retorna erro,
deixando o objeto anterior no Storage.

## Rastreabilidade dos requisitos funcionais

| Requisito                                                     | Evidência encontrada                                                                                       | Status                                                                                      |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| FR-001 — upload de imagem para projeto                        | `MediaManagementService.uploadProjectImage()`, formulário administrativo e teste unitário de upload válido | **Parcial** — não validado em Storage real nem no fluxo autorizado da interface             |
| FR-002 — upload de currículo por idioma                       | Métodos `uploadCurriculum()`, interface separada por `pt-BR`/`en` e renderização testada                   | **Parcial** — upload válido de currículo não possui teste unitário/end-to-end dedicado      |
| FR-003 — armazenamento no Supabase Storage                    | Chamadas aos buckets `project-images` e `curricula`, migration e mocks de Storage                          | **Parcial** — migration e Storage real não foram executados                                 |
| FR-004 — referência e metadados associados                    | Inserts em `portfolio_project_images`/`portfolio_files` e contratos de modelos                             | **Parcial** — ausência de confirmação em banco real e de assertions completas dos metadados |
| FR-005 — substituição de imagem específica e remoção anterior | RPC `replace_portfolio_project_image`, preservação do registro e teste de remoção do caminho anterior      | **Parcial** — sem policy real, concorrência real ou cenário de falha da remoção             |
| FR-006 — substituição de currículo por locale                 | RPC `replace_portfolio_curriculum`, interface por idioma e fluxo implementado                              | **Não confirmado** — não há teste específico de substituição de currículo                   |
| FR-007 — nova associação disponível publicamente              | Leitor público já usa `storage_path` persistido e o serviço recarrega o snapshot após salvar               | **Não confirmado** — não há teste integrado salvar → reler publicamente                     |
| FR-008 — falha sem falso sucesso                              | Validação de imagem inválida, limpeza após falha de insert e mensagens de erro                             | **Parcial** — faltam falhas reais de Storage, policies, UI e remoção do objeto anterior     |

## Critérios de aceite

| Critério                                  | Status             | Evidência/limite                                                                                             |
| ----------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| AC-001 — upload de imagem                 | **Parcial**        | Serviço, UI e teste unitário; falta ambiente Supabase real                                                   |
| AC-002 — upload dos currículos por idioma | **Parcial**        | UI renderiza os dois locales; falta teste de upload válido e leitura integrada                               |
| AC-003 — substituição                     | **Parcial**        | RPC e remoção do anterior em sucesso; falta teste de currículo, concorrência e falha de remoção              |
| AC-004 — arquivo inválido                 | **Parcial**        | Imagem inválida coberta; currículo inválido e rejeição no bucket/banco não foram executados em ambiente real |
| AC-005 — falha de Storage/persistência    | **Parcial**        | Falha simulada de persistência coberta; falha real e comportamento de limpeza não confirmados                |
| AC-006 — escrita não autorizada           | **Não confirmado** | Policy está na migration, mas não foi executada com os três perfis                                           |

## Checklist

- [x] Spec da Feature revisada: `spec/03-features/upload-substituicao-midias/spec.md`.
  - A Spec está como `Aprovada`.
- [ ] Plano e tarefas estão com status documental convergente.
  - A execução foi solicitada como aprovada, mas os arquivos ainda exibem `Status: Rascunho`.
  - As tarefas permanecem sem `[x]`, conforme a instrução de não marcá-las automaticamente.
- [x] Arquitetura revisada: `spec/02-arquitetura/ARQUITETURA.md`.
  - `media-management` já era uma pasta prevista; a leitura pública continua em
    `portfolio/content`; não foi criado backend próprio.
- [x] Registro de Decisão 005 revisado.
  - Limite: o registro ainda está como `Proposta para revisão de Marcos`.
- [ ] Todo comportamento implementado corresponde integralmente à Spec.
  - Divergência: a Spec exige remoção do objeto anterior/órfão; o serviço faz três
    tentativas e, se todas falharem, mantém a nova referência e o objeto anterior.
- [ ] Critérios de aceite refletem o comportamento final de verdade.
  - AC-003/AC-005 não definem o estado em que a referência nova foi persistida, mas a
    remoção do objeto anterior falhou; o ADR documenta esse comportamento, porém a Spec
    não o explicita.
- [x] Migration e rollback foram revisados estaticamente.
  - Evidências: `supabase/migrations/20260925120000_enable_admin_media_replacement.sql` e
    `spec/05-verificacao/upload-substituicao-midias/migration-rollback.md`.
- [ ] Migration testada em ambiente Supabase controlado.
  - Não confirmado: o Supabase CLI não está disponível e a migration não foi aplicada.
- [x] Sei como reverter a migration em documentação.
  - Limite: os passos estão documentados, mas ainda não foram executados em ambiente
    controlado.
- [ ] Requisitos de prioridade alta têm verificação completa.
  - A verificação automatizada cobre partes dos FRs; Storage real, RLS, concorrência,
    limpeza garantida e fluxo autorizado ainda não foram confirmados.
- [x] Regressão automatizada checada.
  - 15 arquivos e 107 testes passaram; o build passou.
  - Limite: não substitui teste autorizado end-to-end nem validação real do Supabase.
- [x] Verificação visual mínima executada.
  - A página pública carregou e `/admin` sem sessão exibiu a tela de autenticação.
- [x] Procedimento de deploy corresponde ao fluxo planejado.
  - Evidência: `spec/06-deploy/upload-substituicao-midias/deploy.md`.
  - Limite: o procedimento ainda não foi executado.
- [ ] Rollback é executável e ensaiado.
  - Os passos estão descritos, mas não foram testados contra um ambiente aplicado.
- [ ] Marcos revisou e aprovou antes do deploy.
  - Pendente por decisão explícita do aprovador.

## Requisitos de prioridade alta

O plano de verificação não atribui prioridade numérica individual. Ele trata como alta a
cobertura dos FR-001 a FR-008, dos critérios principais e da segurança do Storage/RLS.

**Confirmado automaticamente:**

- compilação Angular;
- suíte de 107 testes;
- validação de imagem inválida;
- upload de imagem com mock;
- substituição de imagem com mock de RPC e remoção do caminho anterior;
- limpeza simulada após falha de persistência;
- renderização da interface administrativa;
- carregamento público e proteção de `/admin` sem autenticação.

**Não confirmado para aprovação:**

- upload e substituição reais no Supabase Storage;
- associação real em PostgreSQL;
- RLS/grants com `anon`, usuário não autorizado e Marcos;
- substituição real de currículo;
- remoção garantida do objeto anterior quando a remoção falha;
- concorrência real com prevalência da última operação confirmada;
- ciclo completo administração → persistência → página pública.

Portanto, os requisitos de prioridade alta **não estão todos confirmados**.

## Indícios de regressão

Não há indício de regressão automatizada: a suíte completa e o build passaram, e a página
pública continuou carregando. A área administrativa sem autenticação continuou protegida.

A conclusão é limitada: não foi possível testar a área de mídia com uma sessão real de
Marcos, nem validar a leitura pública após uma escrita real no Supabase. Os avisos de
build sobre o orçamento do bundle inicial e de `portfolio-page.scss` permanecem, mas não
impedem a compilação.

## Divergências encontradas

1. **Remoção não garantida:** `removeRequiredObject()` tenta remover o objeto três vezes.
   Se falhar, a referência nova já está persistida e o objeto anterior permanece. Isso
   diverge da exigência absoluta da Spec de remover o objeto anterior e objetos órfãos.
2. **ADR ainda não aprovado:** o código depende da decisão registrada em
   `DECISAO-005-substituicao-segura-de-midias.md`, que permanece como proposta.
3. **Migration não aplicada:** a policy de `delete`, as funções SQL e os grants foram
   revisados estaticamente, mas não foram validados pelo Supabase.
4. **Cobertura de testes incompleta:** não há teste específico para substituição de
   currículo, fluxo completo público após upload, policies reais ou concorrência real.
5. **Status documental:** Spec está `Aprovada`, enquanto plano e tarefas ainda estão
   `Rascunho`; as tarefas continuam desmarcadas conforme solicitado.

## Gate de decisão

- [x] Documentação, rastreabilidade e estrutura revisadas.
- [x] Testes automatizados e build executados com sucesso.
- [x] Regressão automatizada mínima executada.
- [ ] Todos os requisitos de prioridade alta confirmados.
- [ ] Divergência de remoção garantida resolvida e refletida na Spec/ADR.
- [ ] ADR 005 aprovado por Marcos.
- [ ] Migration, RLS e rollback validados em Supabase controlado.
- [ ] Fluxo end-to-end administrativo → público validado.
- [ ] Marcos aprovou o deploy.

**Conclusão:** a feature está em convergência parcial e **não deve ser considerada
aprovada para deploy neste momento**. A decisão final permanece com Marcos.
