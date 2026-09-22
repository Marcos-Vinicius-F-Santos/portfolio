# Checklist de Convergência — Estrutura Base do Portfólio Público

Status: Revisão concluída — deploy não aprovado  
Data: 2026-09-22  
Commit revisado: `118f2b1 feat: create public portfolio base`

Spec relacionada: `spec/03-features/estrutura-base-portfolio-publico/spec.md`  
Plano relacionado: `spec/04-plano/estrutura-base-portfolio-publico/plano.md`  
Tarefas relacionadas: `spec/04-plano/estrutura-base-portfolio-publico/tarefas.md`

## Resumo da revisão

A comparação foi feita entre a Spec da Feature, o plano/tarefas, o código em `src/` e
os testes Vitest. A implementação converge com os requisitos funcionais e os critérios de
aceite principais. O deploy permanece bloqueado neste checklist por duas pendências de
entrega: o procedimento de deploy ainda não foi configurado/verificado e o rollback por
Git não está comprovado para o commit raiz atual.

## Rastreio Spec ↔ Plano/Tarefas ↔ Código ↔ Testes

| Requisito | Código | Teste/evidência | Status |
|---|---|---|---|
| FR-001 — página única Angular com as três seções | `src/app/app.html`, `src/app/app.ts` e `src/app/features/portfolio/presentation/portfolio-page/portfolio-page.html` | `app.spec.ts`, `portfolio-page.spec.ts`, build aprovado e página carregada no navegador | Confirmado |
| FR-002 — identidade técnica com preto, vermelho e verde | `portfolio-page.scss` e `src/styles.scss` | Inspeção visual em navegador e build aprovado; não há teste automatizado de contraste | Confirmado com ressalva visual |
| FR-003 — navegação interna entre seções | `navigationItems` e `navigateToSection()` em `portfolio-page.ts` | Teste automatizado de navegação, teste de alvo inexistente e verificação manual dos links | Confirmado; cobertura automatizada detalha um destino e a cobertura dos demais foi manual |
| FR-004 — layout responsivo desktop/móvel | Grid de três colunas e `@media (max-width: 760px)` em `portfolio-page.scss` | Verificação visual em viewport ampla e viewport estreita, além de build aprovado | Confirmado manualmente; não há teste automatizado de viewport |
| AC-003 — alvo inexistente não quebra a página | `target?.scrollIntoView?.()` sem tela de erro | Teste automatizado em `portfolio-page.spec.ts` | Confirmado |

## Requisitos

- [x] Todo comportamento implementado corresponde a um requisito da Spec ou está documentado como decisão consciente fora da Spec.
  - O conteúdo das três seções é estrutural/placeholder, conforme o plano e o fora de
    escopo da feature. A integração com Supabase, traduções e administração não foi
    implementada.
- [x] O critério de aceite reflete o comportamento final de verdade.
  - AC-001: página única e navegação verificadas em viewport ampla.
  - AC-002: layout empilhado verificado em viewport estreita e layout em colunas em
    viewport ampla.
  - AC-003: alvo inexistente testado sem erro.

## Arquitetura

- [x] A estrutura de pastas/módulos respeita `spec/02-arquitetura/ARQUITETURA.md`.
  - O código da feature está em `src/app/features/portfolio/presentation/`.
  - Não foi criada uma feature `content`, camada de backend, integração Supabase ou
    estrutura global nova por tipo de arquivo.
- [x] Nenhum limite arquitetural foi cruzado.
  - Não há acesso a banco, escrita pública, autenticação, migration ou rota pública
    adicional.

## Dados

- [x] Migration testada, se houve mudança de schema — não aplicável; não houve mudança de schema, banco, Storage ou Supabase.
- [ ] Sei como reverter se a migration der problema — não aplicável quanto a migration, mas o rollback geral da entrega ainda não foi confirmado.

## Testes

- [x] Requisitos de prioridade alta têm verificação feita.
  - O plano não atribui IDs de prioridade explicitamente; pela estratégia do template de
    verificação, o caminho principal corresponde a FR-001/FR-003 e a responsividade a
    FR-004. Todos foram verificados manualmente ou automaticamente. FR-001 e FR-003 têm
    testes automatizados; FR-004 foi verificado visualmente em viewport ampla e estreita.
- [x] Regressão checada — não há indício de regressão em features existentes.
  - O projeto era novo antes da implementação e continha apenas documentação/specs;
    não havia runtime ou feature anterior para preservar.
- [x] Suíte automatizada executada: 2 arquivos de teste e 5 testes aprovados com Vitest.
- [x] Build de produção executado com sucesso via `npm run build`.
- [ ] Lint ou checagem equivalente — não pôde ser confirmado porque o projeto não possui script `lint` configurado.

## Entrega

- [ ] O procedimento de deploy corresponde ao que realmente será feito.
  - Não confirmado. O deploy está fora do escopo desta feature, não há configuração
    `vercel.json`, projeto Vercel ou remote GitHub verificado neste ciclo.
- [ ] O rollback é executável.
  - Não confirmado. O commit `118f2b1` é o commit raiz do repositório; portanto, `git
    revert 118f2b1` não é um procedimento de rollback comprovado por ter um commit pai.
    Antes do deploy, é necessário definir um baseline anterior, uma estratégia de
    restauração/rollback da Vercel ou outro procedimento operacional testável.
- [x] Existe um estado versionado da implementação: commit `118f2b1`.
- [x] Nenhum deploy foi executado ou aprovado por esta revisão.

## Divergências encontradas

1. A Spec e as tarefas foram sincronizadas durante esta revisão para refletir a aprovação
   informada por Marcos: a Spec agora está `Aprovada` e T-013 está marcada como concluída.
2. O plano/tarefas descreve cobertura automatizada dos destinos de navegação, mas o teste
   automatizado verifica diretamente o deslocamento de um destino e a existência dos três
   links. Os outros destinos foram verificados manualmente; recomenda-se ampliar o teste
   automatizado antes de tratar a cobertura como completa.
3. A tarefa T-007 menciona viewport desktop, móvel estreita e móvel larga. Foi confirmada
   uma viewport ampla e uma estreita; a viewport móvel larga específica não foi isolada
   como cenário automatizado ou evidência separada.
4. O plano descreve rollback por reversão do commit, mas o commit atual é o commit raiz.
   Essa divergência de entrega precisa ser resolvida antes do deploy.
5. O projeto não possui script de lint; a checagem de qualidade disponível nesta rodada foi
   build de produção e suíte Vitest.

## Decisão do portão

- [x] Convergência funcional confirmada para FR-001 a FR-004 e AC-001 a AC-003.
- [ ] Deploy aprovado — permanece pendente de decisão de Marcos.
- [ ] Checklist de entrega/rollback confirmado — permanece pendente das divergências 3 e 4.