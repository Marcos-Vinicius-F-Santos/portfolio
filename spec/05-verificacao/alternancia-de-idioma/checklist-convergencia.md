# Checklist de Convergência — Alternância de Idioma

Status: Revisão concluída — deploy não aprovado  
Data: 2026-09-23  
Commit revisado: não há commit de release; revisão baseada nos arquivos atuais do workspace e nas evidências registradas.

Spec relacionada: `spec/03-features/alternancia-de-idioma/spec.md`  
Plano relacionado: `spec/04-plano/alternancia-de-idioma/plano.md`  
Tarefas relacionadas: `spec/04-plano/alternancia-de-idioma/tarefas.md`  
Evidências de teste: `spec/05-verificacao/alternancia-de-idioma/plano-de-teste.md`  
Procedimento de entrega: `spec/06-deploy/alternancia-de-idioma/deploy.md`

Este checklist aplica as seções do checklist de projeto `spec/05-verificacao/checklist-convergencia.md` à feature de alternância. O checklist da estrutura base foi mantido como registro independente.

## Resumo da revisão

A comparação entre spec, plano/tarefas, código e evidências mostra convergência funcional nos FR-001 a FR-009 e AC-001 a AC-012. A suíte registrada contém 54 testes aprovados; o build de produção passou. Há evidência de navegação, pop-up, cache, fallback e preservação da rolagem em Chrome desktop e emulações móveis.

Não foi identificado indício de regressão na estrutura pública existente. Os IDs e as três âncoras permanecem; há testes de regressão de navegação e do componente raiz.

O deploy **não está aprovado por esta revisão**. O registro do procedimento diz que não houve commit, push, merge ou deploy. Também não foi confirmado um resultado em outro navegador real ou dispositivo físico.

## Rastreio SPEC ↔ PLANO/TAREFAS ↔ CÓDIGO ↔ TESTES

| Requisito | Código observado | Teste/evidência registrada | Resultado |
|---|---|---|---|
| FR-001 — iniciar pt-BR e restaurar escolha válida | Sinal inicial pt-BR e inicialização após renderização em `portfolio-language.service.ts`; idioma aplicado à raiz em `portfolio-page.ts` | Estado inicial e restauração com pt-BR/en em `portfolio-language.service.spec.ts`; AC-001/010 no plano de verificação | Confirmado |
| FR-002 — sugerir inglês com base no idioma principal | `classifyBrowserLanguage()` usa apenas `navigator.language`; normaliza variantes; diálogo mostra o texto especificado | Testes unitários pt-PT, en-US/en-GB, es e preferência secundária; navegador com pt-PT/es/en-GB, registrados no AC-001/002/006/007/011 | Confirmado |
| FR-003 — aceitar ou recusar sugestão | `respond()` chama aceitar/recusar; recusa fica na preferência salva | Testes de serviço e página, clique manual no navegador; AC-002/003 | Confirmado |
| FR-004 — alternância manual nos dois sentidos | Seletor no cabeçalho atualiza o serviço, cópia exibida e `document.documentElement.lang` | Teste de integração português↔inglês; navegação nos três links em ambos os idiomas; AC-004 | Confirmado |
| FR-005 — fallback da detecção | Exceção ao ler `navigator.language` mantém pt-BR e não abre sugestão | Teste unitário com getter que lança erro e sessão de navegador com idioma indisponível; AC-005 | Confirmado |
| FR-006 — salvar e restaurar escolha | Chave local `portfolio.language.v1`; persiste idioma e recusa; restaura idioma depois do estado inicial pt-BR | Testes de storage/serviço; recarregamento no navegador; AC-003/010 | Confirmado |
| FR-007 — não repetir após recusa, sugerir de novo após apagar | `declined` impede nova sugestão enquanto registro existe; chave ausente volta à regra de preferência | Testes de recusa/cache e remoção de chave; sessão de navegador; AC-003/012 | Confirmado |
| FR-008 — preservar seção e rolagem | Cópias invisíveis dos textos dos dois idiomas reservam geometria; nós e IDs das seções permanecem estáveis | Medições antes/depois em desktop 1440×900, 390×844, 320×568 e perfil iPhone emulado 393 px; AC-002/004/008/009 | Confirmado nos perfis medidos; outro navegador/dispositivo físico não confirmado |
| FR-009 — fallback à língua original por conteúdo | `selectPortfolioCopy()` preserva campos de origem quando tradução/fonte falha | Testes unitários para campo/fonte ausente ou falha; simulação no browser; AC-008/009 | Confirmado |

## Requisitos e arquitetura

- [x] O comportamento implementado corresponde aos requisitos e decisões confirmados na spec.
- [x] Critérios de aceite representam o comportamento observado, com as ressalvas de cobertura indicadas neste checklist.
- [x] Código reside em `src/app/features/portfolio/content/` e `src/app/features/portfolio/presentation/portfolio-page/`, conforme a arquitetura existente.
- [x] Não foram adicionados backend, dependências de tradução, rotas, alterações de banco ou migrations.
- [x] O texto original permanece disponível como fallback por campo, sem reverter a página inteira.
- [ ] Traduções e layout foram aprovados por Marcos separadamente? **Não confirmado por uma evidência de revisão de conteúdo específica.** A aprovação posterior da conclusão das tarefas foi registrada, mas este checklist não infere uma revisão editorial distinta.

## Dados

- [x] Mudança de schema/migration — não aplicável; a preferência é local ao navegador.
- [x] Não há escrita remota nem mudança de dados de visitantes pelo backend.
- [x] Rollback documenta que a chave `portfolio.language.v1` pode permanecer inerte na versão anterior.

## Testes e regressão

- [x] Requisitos de prioridade alta do plano de verificação foram testados: FR-001 a FR-004 e FR-006 a FR-008, incluindo primeira visita, sugestão, resposta, alternância, cache/recusa, navegação e rolagem.
- [x] Evidência de suíte automatizada: 6 arquivos e 54 testes passaram na execução final registrada.
- [x] Evidência de build de produção: `npm run build` passou.
- [x] Evidência de regressão mínima: `app.spec.ts` e `portfolio-page.spec.ts`; teste de alvo realmente ausente; os três IDs/links preservados nos dois idiomas.
- [x] Não há indício de regressão na estrutura base pública nos cenários registrados.
- [ ] Verificação em segundo navegador ou dispositivo físico — **não confirmada**. A segunda configuração foi um perfil iPhone 15 emulado no mesmo Chrome; não equivale a Safari ou aparelho físico.
- [ ] Lint dedicado — **não confirmado**; `package.json` não declara script de lint. `git diff --check` passou segundo o registro de verificação.
- [ ] Teste de armazenamento bloqueado em vários navegadores — **não confirmado**; há teste unitário e cenário no Chrome registrado.

## Entrega

- [x] Procedimento futuro de validação e rollback documentado em `spec/06-deploy/alternancia-de-idioma/deploy.md`.
- [ ] Commit candidato revisado e versionado — **não confirmado**; o procedimento informa que a feature ainda não tem commit de release.
- [ ] Integração/estado atual do GitHub e Vercel verificados para esta versão — **não confirmado**; o deploy não foi realizado.
- [ ] Implantação anterior identificada e rollback operacionalmente exercitado — **não confirmado**. O procedimento exige identificar a implantação válida e revalidar o fluxo antes da publicação.
- [x] Nenhum deploy foi executado ou aprovado por esta revisão.

## Divergências e ressalvas

1. **T-014, verificação em segunda combinação:** tarefas pediam outra combinação navegador/dispositivo. As evidências usam Chrome em desktop, viewports móveis e perfil de dispositivo iPhone 15 emulado. O dispositivo é emulado no mesmo navegador; não comprova compatibilidade com Safari ou outro navegador real. A cobertura principal de prioridade alta tem testes automatizados e medições do Chrome, mas esse item da tarefa está parcialmente confirmado.
2. **Release versionado:** não existe commit de release candidato. Portanto, os resultados referem-se ao estado local evidenciado, e não a um artefato imutável pronto para publicação.
3. **Cobertura de ambiente:** armazenamento bloqueado e erros foram verificados em testes isolados/Chrome conforme o registro. Outros browsers e aparelhos físicos não foram verificados.
4. **Conteúdo editorial:** a implementação traduz os textos estruturais/placeholder da página existente. Conteúdo profissional futuro, currículos e integração Supabase permanecem fora da feature.
5. Não encontrei divergência funcional entre os FR-001 a FR-009 e o comportamento documentado do código nos critérios verificados.

## Decisão do portão

- [x] Revisão de convergência concluída.
- [x] Evidências de teste de prioridade alta encontradas para os fluxos principais.
- [x] Nenhum indício de regressão identificado nas features/código existentes examinados.
- [ ] Itens não confirmados de entrega e cobertura cross-browser resolvidos.
- [ ] Deploy aprovado — **decisão pendente de Marcos; não aprovada por esta revisão.**
