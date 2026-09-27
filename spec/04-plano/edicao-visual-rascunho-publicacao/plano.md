# Plano de Implementação — Edição visual com rascunho e publicação

Spec relacionada: [spec.md](../../03-features/edicao-visual-rascunho-publicacao/spec.md)  
Decisão relacionada: [ADR-008](../../02-arquitetura/DECISAO-008-versionamento-publicacao-editorial.md)  
Documentos de apoio: [schema proposto](schema-proposto.md), [mídias e cache](midias-e-cache.md), [inventário](../../05-verificacao/edicao-visual-rascunho-publicacao/inventario.md)  
Status: Rascunho para aprovação — nenhuma implementação iniciada.

## 1. Resumo técnico

A feature será introduzida de forma incremental sobre os domínios existentes. O administrador editará um rascunho privado por comandos versionados; o site público continuará lendo somente uma revisão publicada e imutável. A publicação validará o rascunho completo, apresentará o resumo das alterações e promoverá um snapshot em uma transação idempotente.

O trabalho começa por segurança, contratos e migrações aditivas. Em seguida, entrega uma fatia vertical pequena antes de ampliar a interface para todas as seções, mídias e idiomas. O leitor legado permanece disponível durante a migração, mas seus escritores serão bloqueados no corte para evitar duas fontes de verdade.

## 2. Impacto no que já existe

| Componente existente | Mudança planejada | Compatibilidade e risco |
| --- | --- | --- |
| `src/app/core/auth/` | Reutilizar a sessão e a identificação de administrador para autorizar rascunho, preview e publicação. | Não criar segundo mecanismo de autenticação. Alto risco se a autorização depender apenas da interface. |
| `src/app/core/supabase/` | Adicionar acesso tipado às funções editoriais e aos snapshots publicados. | Preservar o cliente e a configuração atuais. Não expor credenciais privilegiadas no navegador. |
| `src/app/features/admin/content-management/` | Concentrar comandos, revisão esperada, autosave, validação, publicação, descarte e histórico. | Substitui escrita direta nas tabelas públicas. Alto risco de conflito entre abas e de dupla escrita durante a transição. |
| `src/app/features/admin/media-management/` | Passar a usar uploads privados temporários, validação de arquivo e associação à revisão. | Arquivos publicados precisam continuar acessíveis; arquivos de rascunho não podem vazar. |
| `src/app/features/portfolio/content/` | Adicionar leitor de snapshot versionado e compatibilidade temporária com a fonte atual. | Home, detalhe de projeto e navegação devem permanecer na mesma revisão. |
| `src/app/features/portfolio/presentation/` | Reutilizar os componentes visuais no modo de edição e preview por propriedades explícitas. | O modo público não pode carregar controles administrativos nem alterar links, idioma ou responsividade. |
| Rotas públicas e administrativas | Acrescentar entrada no modo de edição, preview e navegação editorial protegida. | Acesso direto e recarregamento precisam manter autorização e revisão. |
| Banco Supabase | Adicionar rascunho, traduções, revisões, snapshots, estado publicado, RPCs, RLS e grants mínimos. | Migrações aditivas primeiro; nenhuma alteração manual sem migration e caminho de volta. |
| Supabase Storage | Criar fluxo privado para uploads e resolver referências publicadas conforme a revisão. | Storage não participa da transação SQL; exige estados e limpeza recuperáveis. |
| Conteúdo local de fallback | Importar o conteúdo efetivamente visível e registrar o que continuará como fallback durante o corte. | O inventário mostrou conteúdo local que não existe no banco; ignorá-lo causaria perda visual. |

## 3. Componentes novos

### 3.1 Dentro da arquitetura existente

- `src/app/features/admin/content-management/`: modelos editoriais, comandos, fila de autosave, validação de publicação, comparação de revisões e histórico. Esses itens pertencem ao domínio de gestão de conteúdo já definido.
- `src/app/features/admin/media-management/`: validação, upload temporário, associação, resolução e limpeza de mídia. Não será criado outro domínio para arquivos.
- `src/app/features/portfolio/content/`: contrato do snapshot público, leitor por revisão e adaptador temporário da fonte legada.
- `src/app/features/portfolio/presentation/`: pontos de composição reutilizados pelo público, preview e edição, sem incorporar persistência.
- `src/app/core/auth/` e `src/app/core/supabase/`: apenas integrações transversais de autenticação e acesso ao Supabase.
- `supabase/migrations/`: toda mudança de schema, grants, RLS, funções, importação e rollback técnico.
- `spec/05-verificacao/edicao-visual-rascunho-publicacao/`: matriz, evidências e resultado da verificação.

### 3.2 Novo módulo justificado

Será criado `src/app/features/admin/visual-editor/` para a camada de interface do editor: barra editorial, campo contextual, abas de idioma, ordenação, revisão antes da publicação, preview e histórico.

A pasta administrativa atual separa autenticação, gestão de conteúdo e gestão de mídia. Colocar toda a interface visual dentro de `content-management` misturaria apresentação com persistência e produziria mais de três componentes coesos sem fronteira clara. O novo módulo continua dentro do domínio `admin`, depende dos serviços existentes e não introduz uma nova camada arquitetural.

Não será criada uma nova pasta em `shared` antecipadamente. Um componente só será promovido para `shared` quando houver reutilização real fora do editor e do portfólio.

## 4. Mudanças de dados e banco

A implementação seguirá o desenho de [schema-proposto.md](schema-proposto.md), sempre convertido em migrations revisáveis. Os nomes finais de tabelas, funções e índices serão confirmados na revisão da migration; o documento de apoio não será executado como SQL.

A sequência de banco será:

1. criar testes de autorização e uma migration que retire grants excessivos das tabelas próprias sem alterar indiscriminadamente schemas gerenciados pelo Supabase;
2. criar, de forma aditiva, entidades editoriais, traduções, estado singleton, revisões e snapshots imutáveis;
3. aplicar RLS e grants mínimos para `anon`, `authenticated` e administrador, incluindo testes de acesso direto e pelas RPCs;
4. criar funções transacionais com revisão esperada e chave de idempotência para comandos, descarte, restauração e publicação;
5. criar buckets/políticas privadas e estados recuperáveis para uploads, associações e limpeza;
6. importar o conteúdo efetivamente exibido, incluindo os fallbacks locais, e gerar o snapshot inicial;
7. habilitar o leitor de snapshot por configuração reversível;
8. bloquear os escritores legados antes do corte definitivo.

O `format_version` do snapshot inicia em `1`. O leitor rejeitará versões desconhecidas e cada mudança incompatível exigirá migrador explícito, corpus de compatibilidade e revisão da ADR.

### Migração e rollback

Antes do ensaio e do corte serão produzidos backup dos registros, inventário dos objetos e hash do snapshot inicial. A importação será repetível e deverá falhar sem promover uma revisão incompleta.

Até o corte, o rollback poderá voltar ao leitor legado. Depois que os escritores antigos forem bloqueados, o rollback seguro será uma versão anterior do aplicativo que entenda snapshots, mantendo rascunhos e histórico. Reativar escrita legada não faz parte do rollback porque recriaria duas fontes de verdade. O ensaio em ambiente controlado deve registrar duração, perdas esperadas, procedimento e resultado.

## 5. Sequência de implementação

### Fase 1 — Base

T-001 a T-007: congelar o baseline, aceitar a decisão arquitetural, definir contratos, corrigir grants, criar o schema privado, configurar mídia privada e importar o conteúdo inicial. Nenhuma interface administrativa será disponibilizada nesta fase.

### Fase 2 — Lógica principal

T-008 a T-015: implementar comandos, autosave, conflitos, validação, resumo, publicação, leitura coerente, descarte, histórico e a primeira fatia vertical. A fatia vertical prova o fluxo completo com um campo antes de ampliar o escopo.

### Fase 3 — Interface

T-016 a T-026: habilitar o modo administrativo, edição contextual, campos estruturados, idiomas, ordenação acessível, inclusão/remoção, mídia, preview, histórico e retirada da escrita direta. Cada tarefa inclui sua própria verificação funcional.

### Fase 4 — Testes

T-027 a T-029: executar a matriz automatizada e manual, testar segurança e concorrência, validar regressão pública e ensaiar migração/rollback com evidências.

### Fase 5 — Entrega

T-030 a T-032: reconciliar spec/plano/código/testes, obter a aprovação de Marcos e somente então executar o corte e a verificação em produção.

A fase final de testes complementa, sem substituir, os testes realizados em cada tarefa.

## 6. Riscos

| Risco | Probabilidade | Impacto | Mitigação | Registro de Decisão |
| --- | --- | --- | --- | --- |
| Publicação deixar público e rascunho em estados diferentes | Média | Crítico | Uma RPC transacional, revisão esperada, idempotência e testes de falha. | **Sim — coberto pela ADR-008, aceita em 2026-09-26.** |
| Snapshot expor dado administrativo ou tradução inativa | Média | Crítico | DTO por allowlist, validador de publicação e inspeção do payload anônimo. | Coberto pela ADR-008. |
| Grants atuais permitirem operações além do necessário | Confirmada | Alto | Migration mínima, testes por perfil e proibição de `TRUNCATE`/escrita direta. | Não; correção de segurança dentro da arquitetura vigente. |
| Conteúdo local não ser importado porque não existe nas tabelas remotas | Confirmada | Alto | Baseline visual, inventário por ID e comparação do snapshot inicial com o site atual. | Não. |
| Duas abas sobrescreverem alterações | Média | Alto | `expected_revision`, fila ordenada, idempotência e conflito visível. | Coberto pela ADR-008. |
| Storage ficar fora de sincronia com a transação SQL | Média | Alto | Upload temporário, estado de associação, claims de limpeza e tarefas repetíveis. | Coberto pela ADR-008 para o fluxo proposto. |
| URL assinada permanecer válida até expirar | Conhecida | Médio | TTL curto, escopo somente publicado e renovação controlada. | Coberto pela ADR-008; nova ADR apenas se houver proxy/assinador próprio. |
| Validação confiável de SVG exigir execução em servidor | Média | Alto | Bloquear SVG novo até validar bytes e conteúdo em ambiente confiável. | **Sim, nova ADR se exigir Edge Function ou outro serviço novo.** |
| Evolução do snapshot quebrar versões antigas | Média | Alto | `format_version`, migradores explícitos e corpus por versão. | Coberto pela ADR-008. |
| Voltar ao escritor legado após o corte criar duas fontes de verdade | Média | Alto | Rollback por leitor de snapshot; preservar dados editoriais e bloquear escritores antigos. | Coberto pela ADR-008. |
| Ordenação por arrastar não funcionar com teclado ou toque | Média | Médio | Controles alternativos, testes de teclado, foco, leitor de tela e viewport móvel. | Não. |
| Editor aumentar bundle/CSS e degradar o site público | Média | Médio | Carregamento apenas na rota/modo admin, limites atuais e comparação de build. | Não. |
| Funções `SECURITY DEFINER` permanecerem executáveis por `authenticated` fora do papel administrativo | Conhecida | Alto | As funções exigem `require_editorial_admin` internamente; revisar grants e executar matriz ACL antes da publicação. | **Sim, se a revisão exigir alteração do contrato de RPC.** |

## 7. Resolução dos portões técnicos

| Portão | Situação | Decisão e evidência |
| --- | --- | --- |
| ADR-008 e contrato do snapshot | **Resolvido em 2026-09-26** | Marcos aprovou a ADR-008. Fica aceito o snapshot v1 imutável, com `formatVersion: 1`, gerado e validado no servidor. O DDL continua revisado migration por migration. |
| Limite global dos currículos | **Parcialmente resolvido** | O ambiente local controlado configura limite global de 50 MiB em `supabase/config.toml`. O bucket remoto `curricula` tem `file_size_limit = null`, portanto herda o limite global da conta, cujo valor não está nos artefatos coletados. Confirmar esse valor nos Storage Settings ou com um teste de fronteira antes de T-006/T-023; não tratar `null` como ilimitado. |
| Validação dos bytes de SVG | **Decisão resolvida em 2026-09-26; corpus pendente** | Marcos aprovou a ADR-009 e a Edge Function foi publicada com JWT obrigatório. SVG novo permanece bloqueado até o corpus de segurança e a associação no editor passarem na verificação; assets SVG locais existentes continuam como `source=bundled`. |
| Ambiente de migration e rollback | **Resolvido para o ensaio** | Usar a pilha Supabase local definida em `supabase/config.toml`, com cópia sanitizada do inventário e fixtures. O preview Vercel documentado aponta para o projeto remoto `jjndvtjhxutuerwvjocy` e não será usado para migration destrutiva ou rollback. Depois do ensaio local, o preview serve apenas para smoke test não destrutivo. |

Qualquer desvio do schema híbrido, da publicação transacional, do modelo de mídia privada ou da política de rollback exige atualização do plano e nova aprovação antes da implementação. A confirmação do limite global remoto continua bloqueando a definição final do teto de PDF. Para SVG, a decisão está tomada, mas a função e o corpus de segurança continuam bloqueando a habilitação do formato. Esses itens não impedem contratos, grants e schema editorial sem upload.



