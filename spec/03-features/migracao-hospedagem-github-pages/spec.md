# Spec da Feature — Migração completa da Vercel para GitHub Pages

Status: Implementação local concluída — publicação externa pendente
Projeto: Portfólio Profissional
Onde vive no código: `.github/workflows/`, `scripts/`, `package.json`, `angular.json`,
`public/`, `spec/02-arquitetura/` e documentação de deploy.

## 1. Objetivo

Retirar a aplicação do fluxo da Vercel e publicar o portfólio Angular no GitHub Pages
do repositório `Marcos-Vinicius-F-Santos/portfolio`, usando GitHub Actions para gerar e publicar o
artefato de produção. A migração deve manter a página pública, as rotas administrativas,
a configuração pública do Supabase e um caminho de rollback por commit.

## 2. Como funciona hoje

- O build Angular gera o artefato do navegador em `dist/portfolio/browser`.
- O `prebuild` gera `public/runtime-config.js` a partir de variáveis de ambiente.
- A aplicação usa roteamento de caminho do Angular, com `/`, `/projetos/:id`, `/admin`,
  `/admin/editor`, `/admin/media` e `/admin/editor/projetos/:id`.
- O `src/index.html` usa `<base href="/">`, adequado para servir na raiz de um domínio,
  mas não para o subcaminho `/portfolio/` do GitHub Pages de projeto.
- O repositório ainda contém `vercel.json`, o vínculo local ignorado `.vercel/` e
  documentação operacional da Vercel.
- Não existe workflow de publicação no GitHub Pages.

## 3. Requisitos funcionais

### FR-001 — Build de produção no GitHub Actions

QUANDO houver push na branch padrão `master` ou execução manual do workflow
O SISTEMA DEVE instalar as dependências pelo lockfile, gerar o runtime público e
executar o build Angular de produção para o subcaminho `/portfolio/`.

### FR-002 — Publicação do artefato correto

QUANDO o build terminar com sucesso
O SISTEMA DEVE publicar exclusivamente `dist/portfolio/browser` por meio do ambiente
`github-pages`, usando o artefato oficial do GitHub Pages.

### FR-003 — Configuração pública sem segredos

QUANDO o workflow gerar `runtime-config.js`
O SISTEMA DEVE consumir as variáveis públicas configuradas no repositório sem incluir
service role, senha, token administrativo ou chave privada no artefato.

### FR-004 — Subcaminho do projeto

QUANDO o site for servido em `https://marcos-vinicius-f-santos.github.io/portfolio/`
O SISTEMA DEVE resolver scripts, estilos, favicon, assets e navegação Angular a partir
do subcaminho `/portfolio/`.

### FR-005 — Rotas profundas do SPA

QUANDO um visitante abrir diretamente uma rota Angular válida, como
`/portfolio/projetos/abc` ou `/portfolio/admin/media`
O SISTEMA DEVE entregar um documento de fallback que permita ao Angular iniciar a rota
correspondente sem depender de rewrite da Vercel.

### FR-006 — Remoção do vínculo com a Vercel

QUANDO a migração for implementada
O REPOSITÓRIO DEVE deixar de conter configuração executável, vínculo local ou script
necessário para deploy na Vercel. Registros históricos de deploy permanecem somente
quando servirem como auditoria, sem participar do fluxo ativo.

### FR-007 — Falha segura e rollback

QUANDO as variáveis públicas obrigatórias estiverem ausentes, o build falhar ou a
publicação não puder ser concluída
O WORKFLOW DEVE falhar antes da publicação de um artefato incompleto e permitir a
reexecução de um commit anterior aprovado.

## 4. Regras de negócio

### BR-001 — GitHub Pages é o destino oficial

Novos deploys de produção do portfólio devem ocorrer pelo workflow do GitHub Pages.

### BR-002 — Branch de publicação

A branch oficial de publicação é `master`, que é a branch padrão confirmada do
repositório `Marcos-Vinicius-F-Santos/portfolio`.

### BR-003 — Variáveis públicas fora do código

Valores públicos do Supabase e da identidade do portfólio devem ser fornecidos por
GitHub Actions Variables. Nenhum segredo administrativo pode ser versionado.

### BR-004 — Histórico não é fluxo ativo

Documentos antigos que registram deploys Vercel não autorizam novos deploys e não devem
ser usados pelo build ou pelo workflow atual.

## 5. Critério de aceite

### AC-001 — caminho feliz

Dado um commit aprovado na branch `master` com as variáveis públicas obrigatórias
configuradas
Quando o workflow de GitHub Pages for executado
Então o build deve concluir, gerar `runtime-config.js` e publicar
`dist/portfolio/browser` no ambiente `github-pages`.

### AC-002 — rota profunda

Dado o site publicado no subcaminho `/portfolio/`
Quando o visitante abrir diretamente `/portfolio/projetos/abc`
Então o documento de fallback deve carregar o Angular e a rota de projeto deve iniciar.

### AC-003 — caminho de erro

Dado que uma variável pública obrigatória esteja ausente
Quando o workflow executar o build
Então a verificação deve falhar antes do upload do artefato e indicar a variável ausente.

### AC-004 — segurança do artefato

Dado o artefato gerado pelo workflow
Quando seus arquivos forem inspecionados
Então não deve haver service role, senha, token administrativo ou chave privada.

### AC-005 — remoção da Vercel

Dado o repositório após a migração
Quando forem inspecionados os arquivos de configuração e scripts ativos
Então não deve existir `vercel.json`, vínculo `.vercel/` ou comando ativo de deploy Vercel.

## 6. Casos de erro / edge cases

- O GitHub Pages de projeto usa o subcaminho `/portfolio/`; uma alteração do nome do
  repositório exigirá atualizar o `base href` e a documentação.
- O GitHub Pages não fornece rewrite de SPA equivalente ao da Vercel; o workflow copia
  `index.html` para `404.html` para suportar acesso direto a rotas profundas.
- Um caminho desconhecido também pode receber o documento de fallback do Pages; a
  decisão de uma tela Angular específica de 404 fica fora desta migração.
- O arquivo `runtime-config.js` contém apenas configuração destinada ao frontend. A
  chave publicável do Supabase e o identificador público do administrador não substituem
  RLS nem autorização no backend.
- Falha no job de deploy mantém o deployment anterior do GitHub Pages identificável;
  não há exclusão automática de artefatos anteriores.

## 7. Fora de escopo desta feature

- alterações de schema, dados, Auth, Storage ou Edge Functions do Supabase;
- domínio customizado;
- WAF, rate limiting ou firewall;
- alteração de conteúdo ou layout do portfólio;
- exclusão de registros históricos de deploy da Vercel;
- apagar o projeto remoto da conta Vercel, pois isso é uma ação externa separada do
  repositório e exige confirmação operacional específica.

## 8. Suposições e perguntas abertas

- [x] O repositório alvo é `Marcos-Vinicius-F-Santos/portfolio`, confirmado pelo remote `origin`.
- [x] A branch de publicação é `master`, confirmada como branch padrão no GitHub.
- [x] A URL esperada é `https://marcos-vinicius-f-santos.github.io/portfolio/`.
- [x] A estratégia de rota profunda é cópia de `index.html` para `404.html`, preservando
      as URLs de caminho do Angular.
- [ ] O administrador precisa habilitar uma vez, nas configurações do GitHub, a fonte
      de publicação `GitHub Actions` e cadastrar as Actions Variables públicas.
- [ ] A publicação final e a remoção externa do projeto Vercel aguardam revisão e
      aprovação final do responsável pelo repositório.

## 9. Definition of Done desta feature

- [x] Spec, ADR e plano refletem a decisão GitHub Pages.
- [x] Workflow executa build e deploy na branch `master`.
- [x] Build usa `/portfolio/`, gera `404.html` e valida o artefato.
- [x] Variáveis públicas estão documentadas e segredos não chegam ao bundle.
- [x] Configuração e vínculo local da Vercel foram removidos do repositório.
- [x] Build, testes e verificações da migração passam.
- [ ] URL pública e rotas profundas foram validadas após o workflow.
- [ ] Rollback por commit anterior está documentado e testado.
- [ ] O responsável revisou e aprovou antes da publicação final.
