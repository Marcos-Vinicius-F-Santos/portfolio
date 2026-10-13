# Spec da Feature — Hospedagem e Deploy na Vercel (João Vitor)

Status: Rascunho — pronto para revisão e aprovação de João Vitor  
Data: 2026-10-13  
Projeto: Portfólio Profissional — João Vitor Dias Fernandes  
Onde vive no código:  
- Configuração Vercel: `vercel.json`
- Script de Configuração em Runtime: `scripts/generate-runtime-config.mjs`
- Script de Build Angular: `angular.json`, `package.json`
- Repositório Git: `https://github.com/joaovitordf/portfolio`

---

## 1. Objetivo

Configurar e disponibilizar a hospedagem oficial do portfólio profissional de **João Vitor Dias Fernandes** na plataforma **Vercel** sob o plano Hobby (custo zero), com integração contínua (CI/CD) conectada ao seu repositório GitHub (`joaovitordf/portfolio`), injeção dinâmica de variáveis de ambiente do Supabase e suporte integral ao roteamento SPA (Single Page Application).

---

## 2. Como Funciona Hoje vs. Como Deve Funcionar

### Situação Atual
1. O repositório herdou um `vercel.json` mínimo (`{ "rewrites": [{ "source": "/projetos/:id", "destination": "/index.html" }] }`) que não contempla as demais rotas da aplicação (como `/admin`, `/admin/media`, `/admin/editor`, `/admin/editor/projetos/:id`).
2. Recarregar a página (F5) ou acessar diretamente qualquer rota além de `/projetos/:id` resulta em erro **404 (Not Found)** da Vercel.
3. Não havia documentação operacional (SDD) específica para a conta e repositório de João Vitor (`joaovitordf`), existindo apenas o registro antigo de deploy do Marcos.

### Situação Almejada
1. O arquivo `vercel.json` configurado com diretório de saída explícito (`dist/portfolio/browser`), comando de build oficial (`npm run build`) e regra universal de reescrita SPA para todas as rotas de navegação da aplicação.
2. Injeção segura em tempo de compilação/runtime das variáveis de ambiente (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ADMIN_USER_ID`) configuradas no painel da Vercel.
3. Deploy conectado ao branch `master` do GitHub (`joaovitordf/portfolio`) para publicação automatizada a cada push aprovado, ou executável via Vercel CLI.
4. Procedimento de verificação pós-deploy e estratégia documentada de rollback instantâneo.

---

## 3. Requisitos Funcionais (EARS)

### 3.1 Roteamento SPA e Configuração Vercel
- **FR-001**: O SISTEMA DEVE fornecer um `vercel.json` contendo `buildCommand: "npm run build"`, `outputDirectory: "dist/portfolio/browser"` e regra de reescrita de rotas para `index.html`.
- **FR-002**: QUANDO um visitante acessar diretamente ou recarregar qualquer URL do portfólio (incluindo `/`, `/projetos/:id`, `/admin`, `/admin/editor`, `/admin/media`), O SISTEMA DEVE servir a aplicação Angular sem erro 404.
- **FR-003**: QUANDO um cliente solicitar ativos estáticos existentes (`assets/`, ícones, PDFs de currículo, `runtime-config.js`, bundles `.js`/`.css`), O SISTEMA DEVE servir o arquivo físico diretamente com os devidos headers de cache.

### 3.2 Injeção de Variáveis de Ambiente
- **FR-004**: QUANDO o build for executado na Vercel (`prebuild`), O SISTEMA DEVE executar `node scripts/generate-runtime-config.mjs` consumindo as variáveis `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_ADMIN_USER_ID` cadastradas no projeto Vercel.
- **FR-005**: O SISTEMA NÃO DEVE expor chaves sensíveis ou credenciais administrativas (`service_role` ou senhas) no pacote público da Vercel ou no repositório Git.

### 3.3 Integração e Publicação
- **FR-006**: O SISTEMA DEVE permitir o deploy contínuo via GitHub (`joaovitordf/portfolio` no branch `master`) disparando builds automáticos a cada atualização.
- **FR-007**: O SISTEMA DEVE permitir alternativamente a publicação via Vercel CLI (`npx vercel --prod`) para deploys diretos ou ambientes preview.
- **FR-008**: O SISTEMA DEVE manter a integridade de todas as funcionalidades (painel de contato com canais do João, alternância de idiomas, visualização de projetos e acesso administrativo autenticado).

---

## 4. Regras de Negócio

- **BR-001 — Custo Zero**: A hospedagem deve operar integralmente na camada gratuita da Vercel (Hobby Tier).
- **BR-002 — Imutabilidade de Segredos**: Segredos de infraestrutura permanecem fora do versionamento Git (`.env` no `.gitignore`). Apenas variáveis públicas de runtime são injetadas.
- **BR-003 — Portão de Aprovação**: O deploy em produção requer aprovação final de João Vitor após a verificação dos testes automatizados e do checklist de convergência.
- **BR-004 — Rollback Instantâneo**: Em caso de falha pós-deploy, a restauração da versão anterior deve ser realizável com um único clique no painel da Vercel (Redeploy/Rollback).

---

## 5. Critérios de Aceite (Given / When / Then)

### AC-001 — Acesso e navegação SPA direta
- **Dado** o portfólio publicado na Vercel
- **Quando** o visitante acessar diretamente a URL de um projeto (ex: `/projetos/1`) ou da área administrativa (`/admin`)
- **Então** a página deve carregar corretamente a aplicação Angular sem exibir a tela 404 da Vercel.

### AC-002 — Integração do Supabase em Produção
- **Dado** o ambiente Vercel com as variáveis `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` configuradas
- **Quando** a aplicação iniciar no navegador
- **Então** o script `runtime-config.js` deve inicializar o cliente Supabase e carregar os dados publicados sem lançar exceções de runtime.

### AC-003 — Canais de Contato Pessoais de João Vitor
- **Dado** o portfólio publicado
- **Quando** o usuário preencher o painel de contato e acionar WhatsApp ou E-mail
- **Então** o link gerado deve direcionar para o número `553799429018` e e-mail `profissional.joaovitordf@gmail.com`.

### AC-004 — Download de Currículos
- **Dado** o site em produção
- **Quando** o visitante solicitar o download do currículo em português ou inglês
- **Então** os arquivos `curriculum-pt.pdf` e `curriculum-en.pdf` devem ser servidos integralmente com status HTTP 200.
