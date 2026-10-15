# Plano de Implementação — Hospedagem e Deploy na Vercel (João Vitor)

Status: Rascunho — pronto para revisão e aprovação  
Data: 2026-10-13  
Spec de Referência: [Hospedagem e Deploy na Vercel](../../03-features/hospedagem-vercel-joao-vitor/spec.md)  
Arquitetura: [ADR-013](../../02-arquitetura/DECISAO-013-padronizacao-arquitetural-frontend.md) e [ADR-014](../../02-arquitetura/DECISAO-014-incorporacao-atualizacoes-upstream-painel-contato-e-componentes-admin.md)

---

## 1. Escopo e Objetivos

Este plano define as etapas necessárias para configurar, validar e realizar o deploy do portfólio de João Vitor na plataforma Vercel sob sua própria conta e domínio.

### Valores Operacionais
- **Repositório GitHub**: `https://github.com/joaovitordf/portfolio`
- **Branch de Produção**: `master`
- **Plataforma**: Vercel (Plano Hobby / gratuito)
- **Diretório de Saída do Build**: `dist/portfolio/browser`
- **Comando de Build**: `npm run build` (que executa `prebuild` gerando `runtime-config.js` e compila os bundles do Angular)
- **Comando de Instalação**: `npm install` (ou `npm ci`)

---

## 2. Fases de Execução

### Fase 1 — Ajuste da Configuração Vercel (`vercel.json`)
- Atualizar `vercel.json` para definir explicitamente:
  - `buildCommand`: `npm run build`
  - `outputDirectory`: `dist/portfolio/browser`
  - `rewrites`: regra abrangente para redirecionar todas as rotas da SPA para `/index.html`, garantindo que arquivos estáticos físicos continuem sendo servidos prioritariamente pela Vercel.

### Fase 2 — Validação Local de Build e Verificação de Roteamento
- Executar `npm test` para assegurar que 100% dos 154 testes unitários permanecem válidos.
- Executar `npm run build` para validar a geração dos artefatos estáticos em `dist/portfolio/browser`.
- Verificar se `runtime-config.js`, `index.html` e os currículos em PDF estão presentes no diretório gerado.

### Fase 3 — Documentação Operacional de Deploy
- Criar o checklist de tarefas em `spec/04-plano/hospedagem-vercel-joao-vitor/tarefas.md`.
- Criar a matriz de convergência em `spec/05-verificacao/hospedagem-vercel-joao-vitor/checklist-convergencia.md`.
- Criar o guia operacional de deploy passo a passo em `spec/06-deploy/hospedagem-vercel-joao-vitor/deploy.md` (com instruções tanto para importação automática via dashboard da Vercel quanto via Vercel CLI).

### Fase 4 — Execução do Deploy e Testes de Fumaça em Produção
- Publicar a branch `master` no repositório remoto `joaovitordf/portfolio` (`git push origin master`).
- Vincular o projeto na Vercel configurando as variáveis de ambiente necessárias (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ADMIN_USER_ID`).
- Validar as URLs públicas (raiz `/`, rotas de detalhe de projeto `/projetos/:id`, painel de contato e área administrativa `/admin`).

