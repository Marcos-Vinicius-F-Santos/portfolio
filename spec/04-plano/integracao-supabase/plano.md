# Plano de Implementação — Integração com Supabase para conteúdo e arquivos

Spec relacionada: `spec/03-features/integracao-supabase/spec.md`  
Arquitetura: `spec/02-arquitetura/ARQUITETURA.md`  
Status: Implementação concluída — convergência revisada; deploy pendente de aprovação  
Data: 2026-09-23

## 1. Resumo técnico

Criar um novo projeto Supabase e integrar a aplicação Angular por meio de um cliente
centralizado em `src/app/core/supabase/`, com configurações por ambiente em
`src/app/core/config/`. Os serviços e modelos de leitura ficarão no domínio existente
`src/app/features/portfolio/content/`; a futura escrita administrativa permanecerá em
`src/app/features/admin/`.

Criar migrations em `supabase/migrations/` para textos, experiências, projetos,
traduções em português/inglês, imagens e arquivos. A relação projeto → imagens será
direta, com cardinalidade 1:N. Imagens e arquivos usarão Supabase Storage, com
referências e metadados no banco. A leitura será pública; inserções e atualizações serão
restritas ao único administrador autenticado.

Nesta rodada, a aplicação pública terá somente leitura (`GET`). Não serão criadas telas
administrativas nem fluxos `POST`/`UPDATE`; as policies protegerão as escritas futuras.
A página pública reutilizará o serviço de idioma e o fallback de conteúdo original já
existentes.

## 2. Impacto no que já existe

O projeto já possui uma página pública Angular e conteúdo local em
`src/app/features/portfolio/content/`. Ainda não há cliente Supabase, banco, autenticação
ou Storage configurados no código.

| Componente/arquivo | Mudança | Risco |
|---|---|---|
| `src/app/features/portfolio/content/` | Adicionar modelos e serviços para conteúdo remoto, traduções e imagens | Alto: contrato remoto pode quebrar a página ou o idioma |
| `src/app/features/portfolio/presentation/portfolio-page/` | Consumir leitura remota sem chamadas diretas ao banco | Alto: falha remota pode alterar o comportamento público |
| `src/app/app.config.ts` e `src/app/core/config/` | Registrar cliente e variáveis por ambiente | Alto: configuração incorreta ou segredo exposto |
| `package.json` e `package-lock.json` | Adicionar cliente Supabase com versão fixada | Médio: incompatibilidade de dependências |
| `supabase/migrations/` | Criar schema, Storage, RLS e policies versionadas | Alto: erro de policy pode liberar escrita ou bloquear leitura |
| Testes existentes de conteúdo e página | Adicionar cenários de Supabase e regressão | Médio: mocks incompletos podem ocultar falhas |

Não alterar a organização da página, o serviço de idioma ou as rotas fora do necessário.
Não criar repositories globais, backend próprio ou estrutura fora da arquitetura.

## 3. Componentes novos

- Cliente e configuração Supabase em `src/app/core/supabase/`.
- Configuração por ambiente em `src/app/core/config/`, com `SUPABASE_URL`,
  `SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_ANON_KEY` e `SUPABASE_ADMIN_USER_ID`, sem valores
  reais versionados.
- Modelos e serviços de leitura em `src/app/features/portfolio/content/`.
- Serviço/adaptador para referências de imagens e arquivos do Storage.
- Migrations em `supabase/migrations/`.
- Testes de serviços, policies, Storage, migration e regressão da página.

Não criar nesta feature login, telas administrativas, formulários de edição, fluxos
`POST`/`UPDATE` ou novas seções visuais.

## 4. Mudança de dados/banco

A migration inicial será criada com `supabase migration new`, após conferir a versão e
os comandos disponíveis na CLI. O modelo aprovado para orientar a migration é:

- textos organizados por chave estável, com versões `pt-BR` e `en` separadas;
- experiências com período, contexto, responsabilidades, decisões técnicas e
  resultados, sem nome real de empresa;
- projetos com nome, descrição/contexto, solução, papel, decisões técnicas,
  tecnologias, resultados, aprendizados e links;
- identificadores internos estáveis, preferencialmente UUIDs;
- experiências ordenadas pelo período; projetos e imagens com ordem de exibição;
- imagens em uma relação direta `project_id` → várias imagens;
- arquivos de currículo separados por idioma, um em português e outro em inglês;
- imagens e arquivos com referência ao Storage e metadados no PostgreSQL;
- buckets lógicos separados para imagens de projetos e currículos;
- RLS em todas as tabelas expostas, leitura pública e escrita apenas para o administrador;
- policies de Storage coerentes com as mesmas regras;
- PNG/JPG/JPEG e máximo de 1 MB somente para imagens/arquivos de exibição de projetos.

O administrador será o único usuário do Supabase Auth com e-mail e senha. A policy deve
validar `auth.uid()` contra a identificação aprovada de Marcos, sem usar `user_metadata`
ou `service_role` no frontend.

Os currículos serão armazenados como dois arquivos separados por idioma. O produto ainda
não definiu formato nem tamanho; essa validação ficará para a feature de currículo e não
bloqueia a integração das imagens de projetos.

Para falhas de leitura pública, a aplicação manterá o conteúdo original local por
conteúdo, conforme o fallback já definido na Spec de Alternância de Idioma.

Rollback: não editar migration aplicada. Em desenvolvimento, testar reversão ou migration
compensatória; em ambiente remoto, usar procedimento de reversão/restauração aprovado.
Executar advisors de segurança disponíveis após a migration.

## 5. Sequência de implementação

Executar uma tarefa por vez, na ordem de `tarefas.md`. Nenhuma tarefa será marcada como
concluída sem verificação registrada e aprovação de Marcos.

### Fase 1 — Base

1. Registrar as decisões aprovadas de modelo de dados, administrador, buckets, variáveis
   de ambiente, fallback e seed.
2. Criar o novo projeto Supabase e preparar configurações por ambiente.
3. Confirmar versões compatíveis do cliente/CLI e criar a migration pela CLI.

### Fase 2 — Lógica principal

1. Criar schema relacional, traduções, projetos, imagens, currículos e metadados.
2. Criar buckets e policies do Storage.
3. Ativar RLS e restringir escrita ao administrador.
4. Implementar cliente e serviços de leitura no domínio de conteúdo.

### Fase 3 — Interface

1. Conectar a página pública ao serviço de leitura, preservando Angular e PT/EN.
2. Conectar referências de imagens/arquivos aos contratos existentes, sem criar telas.
3. Aplicar o fallback local por conteúdo quando o Supabase estiver indisponível.

### Fase 4 — Testes

1. Testar cliente, consultas, traduções, relação 1:N, Storage e policies.
2. Testar indisponibilidade, configuração inválida, escrita anônima e arquivos inválidos.
3. Executar regressão da página, idioma, build e testes atuais.
4. Aplicar migration em ambiente local/teste e executar advisors disponíveis.

| Prioridade | Cobertura | Verificação planejada |
|---|---|---|
| Alta | FR-001 a FR-011; AC-001 a AC-006 | Testes automatizados, migration, consulta pública e tentativa de escrita anônima |
| Alta | RLS, Storage e Data API | Advisors, consultas com `anon`/`authenticated` e inspeção de ausência de `service_role` |
| Alta | Página e idioma | `npm test`, `npm run build` e verificação manual desktop/móvel |
| Média | Falhas e arquivos inválidos | Mocks de erro e validação sem persistir recurso inválido |

O projeto não declara lint; não inventar comando de lint. Consultar `supabase --help`
antes de executar comandos específicos da CLI.

### Fase 5 — Entrega (deploy/rollback)

1. Comparar Spec, plano, tarefas, código, migrations e testes.
2. Revisar variáveis, permissões, policies e ausência de segredos.
3. Preparar aplicação e rollback por ambiente, sem executar deploy nesta rodada.
4. Submeter para revisão e aprovação final de Marcos.

## 6. Riscos

| Risco | Chance | Impacto | Como mitigar | Merece Registro de Decisão? |
|---|---|---|---|---|
| Schema relacional divergir dos campos de produto | Média | Alto | Usar o modelo aprovado e revisar migration antes da aplicação | Sim se houver mudança de domínio ou decisão cara de reverter |
| RLS/Storage permitir escrita pública | Média | Alto | Policies explícitas, RLS, testes negativos e advisors | Não enquanto seguir a arquitetura; sim se o modelo de autorização mudar |
| Identificação do administrador ficar insegura | Baixa | Alto | Usar Supabase Auth, `auth.uid()` e nunca `user_metadata`/`service_role` no frontend | Sim se exigir novo limite arquitetural |
| Troca de conteúdo local por remoto quebrar página/idioma | Média | Alto | Adaptador no domínio existente, fallback original por conteúdo e regressão | Não; a solução segue feature existente |
| Currículo ter formato/tamanho indefinido | Média | Médio | Armazenar por idioma sem aplicar validação de imagem; decidir na feature de currículo | Não nesta rodada |
| Cliente/CLI incompatível | Média | Médio | Conferir documentação/changelog, fixar versões e validar lockfile/build | Não, salvo mudança de stack |
| Tabelas expostas sem grants adequados | Média | Alto | Verificar Data API separadamente de RLS e testar papéis públicos/autenticados | Não; é verificação de implementação |

Não há Registro de Decisão obrigatório neste momento. Criar um ADR se a implementação
precisar mudar o modelo de domínio, o único administrador ou os limites da arquitetura.

## 7. Decisões aprovadas antes de começar

- Conteúdos: textos, experiências e projetos com os campos definidos na proposta do
  produto; empresas permanecem anonimizadas.
- Traduções: estrutura separada, apenas `pt-BR` e `en`, selecionada pelo serviço de
  idioma já existente.
- Identificadores: UUIDs internos estáveis; chaves de conteúdo/idioma permanecem
  estáveis para consulta e fallback.
- Imagens: relação direta projeto → N imagens, com referência e metadados no banco.
- Arquivos: Storage separado para imagens de projetos e currículos; um currículo por
  idioma.
- Administrador: somente Marcos, autenticado via Supabase Auth com e-mail e senha;
  policies baseadas em `auth.uid()`.
- Leitura e escrita: leitura pública; escrita futura somente para Marcos.
- Consulta atual: somente `GET`; `POST`/`UPDATE` serão features futuras.
- Projeto Supabase: será criado um novo projeto; configurações usam variáveis de ambiente
  `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (ou `SUPABASE_ANON_KEY`) e
  `SUPABASE_ADMIN_USER_ID`. Cada fork/deploy fornece seus próprios valores sem alterar o
  código compartilhado.
- Falha de leitura: preservar o conteúdo original local por conteúdo, conforme FR-009 da
  Alternância de Idioma.
- Seed: não necessário nesta rodada; testes usam fixtures e conteúdo real será incluído
  pela futura área administrativa.
- Arquivos de projeto: PNG/JPG/JPEG até 1 MB.

### Ponto deliberadamente adiado

O produto ainda não define formato nem limite de tamanho dos currículos. Essa decisão fica
para a feature de currículo e não bloqueia a integração das imagens de projetos.
