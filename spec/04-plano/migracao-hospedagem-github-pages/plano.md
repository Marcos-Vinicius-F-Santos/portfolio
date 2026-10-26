# Plano de Implementação — Migração de hospedagem para GitHub Pages

Spec relacionada: [migracao-hospedagem-github-pages](../../03-features/migracao-hospedagem-github-pages/spec.md)
Status: Implementação local concluída; publicação externa pendente

## 1. Resumo técnico

O fluxo ativo será GitHub → GitHub Actions → artefato `dist/portfolio/browser` →
GitHub Pages. O build usará `base href="/portfolio/"`; após o build, `index.html` será
copiado para `404.html` para suportar rotas profundas do Angular no Pages.

O fluxo da Vercel será retirado do código e do vínculo local. Documentos históricos de
deploy serão preservados como auditoria e marcados como não ativos quando necessário.

## 2. Impacto

| Componente                                  | Mudança                                 | Risco                                   | Mitigação                                                 |
| ------------------------------------------- | --------------------------------------- | --------------------------------------- | --------------------------------------------------------- |
| `.github/workflows/deploy-github-pages.yml` | Novo workflow de build/deploy           | Variável ausente ou permissão incorreta | Falha explícita, permissões mínimas e `workflow_dispatch` |
| `package.json`                              | Scripts específicos de Pages            | Build local e Pages divergirem          | Script único de build Pages e check do artefato           |
| `scripts/prepare-github-pages.mjs`          | Cria `404.html` e `.nojekyll`           | Rota profunda quebrar                   | Verificação automatizada do artefato                      |
| `scripts/check-github-pages.mjs`            | Valida base, arquivos e segurança       | Artefato incompleto ser publicado       | Executar antes do upload                                  |
| `src/index.html`/Angular                    | Base relativa ao subcaminho no workflow | Assets quebrados na URL Pages           | `--base-href /portfolio/` e smoke test                    |
| `vercel.json`/`.vercel`                     | Remoção da configuração e vínculo       | Perder rollback Vercel                  | Rollback passa a ser por commit/deployment Pages          |
| Supabase                                    | Nenhuma alteração                       | Variável pública ausente                | Actions Variables documentadas                            |

## 3. Sequência incremental

### Fase 1 — Spec e arquitetura

- Atualizar spec, plano e tarefas da migração.
- Registrar ADR com branch, URL, subcaminho e fallback.
- Atualizar produto e arquitetura para GitHub Pages.

### Fase 2 — Build e artefato

- Adicionar scripts `build:github-pages`, `prepare:github-pages` e
  `check:github-pages`.
- Criar `404.html` e `.nojekyll` no artefato.
- Validar runtime público e ausência de segredos.

### Fase 3 — Workflow

- Criar workflow com `actions/checkout`, `setup-node`, `configure-pages`,
  `upload-pages-artifact` e `deploy-pages`.
- Executar em `master` e permitir execução manual.
- Usar somente `contents: read`, `pages: write` e `id-token: write`.

### Fase 4 — Limpeza Vercel

- Remover `vercel.json`, o script de verificação exclusivo da Vercel e o vínculo local
  `.vercel/`.
- Remover comandos e instruções ativas de Vercel do fluxo de deploy.
- Preservar registros históricos como documentação não operacional.

### Fase 5 — Verificação e entrega

- Rodar build normal, build Pages, verificações e testes.
- Revisar diff e o artefato.
- Configurar Actions Variables e habilitar Pages com fonte GitHub Actions.
- Executar workflow e validar URL, assets e rotas profundas.
- Somente após aprovação, considerar a migração publicada e remover o projeto remoto Vercel.

## 4. Rollback

O rollback operacional será feito selecionando um commit anterior conhecido e executando
novamente o workflow manualmente nesse commit/branch aprovado. A Vercel não será usada
como mecanismo de rollback após a migração.

## 5. Perguntas abertas

- As Actions Variables públicas ainda precisam ser cadastradas no repositório.
- A fonte `GitHub Actions` precisa ser habilitada nas configurações de Pages na primeira
  publicação.
- A exclusão do projeto remoto da Vercel só ocorrerá após validação do Pages e aprovação.
