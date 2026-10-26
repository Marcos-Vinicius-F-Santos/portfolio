# Registro de Decisão — Migração da Vercel para GitHub Pages

Data: 2026-10-26
Status: Aceita para implementação; publicação final aguarda revisão

## Contexto

O projeto possui frontend Angular estático, configuração pública de runtime e rotas de
caminho. A Vercel era o destino de deploy, mas a direção confirmada pelo solicitante é
retirar o projeto desse fluxo e publicar no GitHub Pages.

O remote `origin` aponta para `Marcos-Vinicius-F-Santos/portfolio`, cujo branch padrão
confirmado é `master`. O GitHub Pages de projeto será servido em
`https://marcos-vinicius-f-santos.github.io/portfolio/`.

## Decisão

1. GitHub Actions será o único fluxo ativo de build e deploy.
2. O workflow executará na branch `master` e também poderá ser acionado manualmente.
3. O build usará `--base-href /portfolio/`.
4. O artefato publicado será `dist/portfolio/browser`.
5. `index.html` será copiado para `404.html`, preservando as rotas de caminho do Angular
   em acesso direto no Pages.
6. A publicação usará `actions/upload-pages-artifact` e `actions/deploy-pages`, com
   permissões mínimas para conteúdo, Pages e identidade.
7. `vercel.json`, `.vercel/` e scripts exclusivos da Vercel serão removidos do fluxo
   ativo. Histórico documental de deploy será preservado como auditoria.

## Alternativas consideradas

| Alternativa                             | Decisão                                                                                       |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| Manter Vercel como fallback             | Rejeitada: contradiz a migração solicitada.                                                   |
| Usar hash routing (`/#/...`)            | Rejeitada: altera URLs públicas e não é necessária com `404.html`.                            |
| Publicar por branch `gh-pages` manual   | Rejeitada: perde o fluxo oficial de artifact/deploy do Pages e dificulta permissões/rollback. |
| Apagar todo histórico textual da Vercel | Rejeitada: remove evidência útil e não é necessária para retirar o fluxo ativo.               |

## Consequências

- O subcaminho `/portfolio/` passa a ser parte do contrato de URLs.
- Variáveis públicas precisam existir como Actions Variables antes da primeira publicação.
- O Pages não substitui autenticação, RLS ou autorização do Supabase.
- Rollback passa a ser reexecução do workflow em commit anterior.
- A exclusão do projeto remoto Vercel é uma operação externa posterior, condicionada à
  validação e aprovação do Pages.
