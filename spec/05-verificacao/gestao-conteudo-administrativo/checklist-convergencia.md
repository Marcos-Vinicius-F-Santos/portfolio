# Checklist de convergência — Gestão de conteúdo pela área administrativa

**Status da revisão:** convergência parcial; deploy não aprovado.

**Data da revisão:** 2026-09-25.

**Escopo revisado:** Spec da Feature, plano, tarefas, código atual, testes automatizados, migration, rollback e Registro de Decisão 004.

## Resumo

Os documentos estão alinhados quanto ao objetivo geral da feature e a suíte automatizada atual passa: 13 arquivos de teste e 102 testes, além do build de produção.

Ainda não foi possível confirmar a convergência completa porque não há teste integrado do fluxo administrativo até a página pública, não houve validação contra um projeto Supabase real, nem foram executados os cenários de RLS com os três perfis previstos. Também permanecem divergências de implementação relacionadas ao log de falhas de publicação e à estratégia para gravações parciais.

## Rastreabilidade dos requisitos funcionais

| Requisito | Evidência encontrada | Status |
|---|---|---|
| FR-001 — adicionar os sete tipos de conteúdo | A interface contempla os sete tipos e há teste de renderização/validação; não há teste de adição persistida para cada tipo | **Não confirmado** |
| FR-002 — editar em português e inglês | A interface renderiza uma box por idioma; não há teste de edição dos sete tipos nos dois idiomas | **Não confirmado** |
| FR-003 — persistir adições e edições | Há teste unitário com cliente Supabase simulado; não há confirmação contra banco real nem para todos os tipos | **Não confirmado** |
| FR-004 — disponibilizar imediatamente na página pública | A leitura pública dos catálogos tem teste unitário; não há teste integrado salvar → reler na página pública | **Não confirmado** |
| FR-005 — indicar falha sem falso sucesso | Há cobertura parcial de erro de persistência no serviço; não há cobertura completa da interface e dos sete fluxos | **Parcial** |
| FR-006 — registrar falha de disponibilidade pública após persistência | O código registra erros no `catch`, mas não há teste específico de persistência concluída seguida de falha na disponibilidade pública | **Não confirmado** |

## Checklist

- [x] Spec aprovada revisada: `spec/03-features/gestao-conteudo-administrativo/spec.md`.
- [x] Plano e tarefas revisados: `spec/04-plano/gestao-conteudo-administrativo/`.
- [x] Migration e rollback revisados estaticamente: `supabase/migrations/20260925090000_add_editable_portfolio_catalogs.sql` e `spec/05-verificacao/gestao-conteudo-administrativo/migration-rollback.md`.
  - Observação: não foram aplicados em um projeto Supabase real; a CLI do Supabase não está disponível neste ambiente.
- [x] Registro de Decisão 004 revisado: `spec/02-arquitetura/DECISAO-004-conteudo-administrativo-persistido.md`.
- [ ] FR-001 coberto por teste de adição dos sete tipos.
  - Não confirmado: a cobertura atual não executa a adição persistida de cada tipo.
- [ ] FR-002 coberto por teste de edição em português e inglês.
  - Não confirmado: há representação das duas boxes na interface, mas não o fluxo completo de edição nos sete tipos.
- [ ] FR-003 coberto por confirmação de persistência.
  - Não confirmado: os testes usam cliente Supabase simulado e não verificam o banco real.
- [ ] FR-004 coberto por releitura pública após salvamento.
  - Não confirmado: não há teste integrado administrativo → persistência → página pública.
- [ ] FR-005 coberto por falha sem falso sucesso.
  - Parcial: existe teste de retorno de erro no serviço, mas não há confirmação para todos os formulários nem para o comportamento visual de erro.
- [ ] FR-006 coberto por registro do log após falha de disponibilidade pública.
  - Não confirmado: não existe cenário de teste que simule esse ponto específico da publicação.
- [ ] RLS verificado com visitante, conta não autorizada e Marcos.
  - Não confirmado: as policies foram revisadas na migration, mas não foram executadas contra Supabase real com os três perfis.
- [x] Regressão automatizada pública e de autenticação executada.
  - Evidência: 13 arquivos de teste passaram, totalizando 102 testes.
  - Limite: não substitui uma validação manual ou end-to-end contra os serviços reais.
- [x] Build de produção executado.
  - Evidência: `npm run build` passou.
  - Atenção: permanecem warnings de orçamento do bundle inicial e de `portfolio-page.scss`.
- [ ] Marcos revisou e aprovou antes do deploy.
  - Pendente por decisão explícita do aprovador.

## Requisitos de prioridade alta

O plano não atribui uma prioridade numérica individual aos FRs. Para esta revisão, foram tratados como prioridade alta todos os requisitos que sustentam o valor e a segurança da feature: FR-001 a FR-006 e a verificação de RLS.

- **Testados automaticamente:** há cobertura parcial para validação, renderização, leitura pública de catálogos e falha de persistência simulada.
- **Não confirmados para aprovação:** adição/edição completa dos sete tipos, persistência real, publicação pública após salvamento, falha pós-persistência e RLS em ambiente Supabase.

Portanto, os requisitos de prioridade alta **não estão todos confirmados**.

## Indícios de regressão

Não há indício de regressão nos testes automatizados existentes: a suíte completa passou e inclui cobertura das áreas pública e de autenticação. A conclusão é limitada ao que os testes exercitam; não houve validação manual nem teste integrado com Supabase real.

## Divergências e riscos encontrados

1. **FR-006 versus implementação:** a implementação usa `console.error` quando uma operação de salvamento lança erro, mas não distingue nem comprova o caso específico “persistiu e depois a disponibilidade pública falhou”.
2. **Gravação parcial:** os salvamentos são sequenciais e não usam transação/RPC nem ação compensatória. Uma falha no meio pode deixar parte das alterações persistida.
3. **Destino do log:** o destino é o console local da aplicação. Isso atende ao mecanismo simples previsto no ADR, mas não resolve observabilidade operacional caso seja necessário investigar falhas em produção.
4. **Migration não validada em ambiente real:** a migration foi revisada estaticamente e criada sem execução da CLI do Supabase disponível neste ambiente; aplicação, rollback e policies ainda precisam de validação real.
5. **Cobertura funcional incompleta:** os testes atuais não percorrem os sete tipos, os dois idiomas e o ciclo completo até a página pública.
6. **Warnings de build:** o build passa, mas excede os limites configurados para o bundle inicial e para `portfolio-page.scss`. Isso não impediu a compilação, porém deve ser acompanhado antes do deploy.

## Gate de decisão

- [x] Documentação e rastreabilidade revisadas.
- [x] Testes automatizados e build executados com sucesso.
- [ ] Todos os requisitos de prioridade alta confirmados.
- [ ] Migration, RLS e rollback validados em Supabase real.
- [ ] Fluxo end-to-end administrativo → público validado.
- [ ] Marcos aprovou o deploy.

**Conclusão:** a feature não deve ser considerada aprovada para deploy neste momento. A decisão final permanece com Marcos.
