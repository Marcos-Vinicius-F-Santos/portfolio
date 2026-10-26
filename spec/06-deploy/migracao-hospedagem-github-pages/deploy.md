# Procedimento de Deploy — Migração para GitHub Pages

Status: Preparado para revisão; publicação final ainda não aprovada
Repositório: `Marcos-Vinicius-F-Santos/portfolio`
Branch de produção: `master`
URL esperada: `https://marcos-vinicius-f-santos.github.io/portfolio/`

## Pré-condições

1. O repositório deve estar com Pages configurado para publicar por `GitHub Actions`.
2. O ambiente `github-pages` deve permitir deploy somente a partir da branch `master`.
3. As seguintes Actions Variables devem existir no repositório:

   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_ADMIN_USER_ID`
   - `PORTFOLIO_AUTHOR_NAME`
   - `PORTFOLIO_BRAND_INITIALS`
   - `PORTFOLIO_PROFILE_ID`
   - `PORTFOLIO_PROFILE_IMAGE_URL`
   - `WEB3FORMS_ACCESS_KEY`

As três primeiras são obrigatórias para o check do artefato. As demais podem ficar
vazias quando a configuração pública correspondente não for usada; nenhum valor de
service role, senha ou token administrativo deve ser cadastrado.

## Validação local

```powershell
npm ci
npm run build
npm run build:github-pages
npm run prepare:github-pages
npm run check:github-pages
npm test -- --watch=false
npm run check:white-label
git diff --check
```

O build Pages deve produzir `index.html`, `404.html`, `runtime-config.js`, `robots.txt`,
`favicon.ico` e `assets/` em `dist/portfolio/browser`.

## Publicação

1. Faça push do commit aprovado para `master` ou execute manualmente o workflow
   `Deploy portfolio to GitHub Pages` a partir de `master`.
2. Confirme que os jobs `build` e `deploy` concluíram com sucesso.
3. Abra a URL publicada e valide a home, um projeto, `/admin`, assets, `robots.txt` e
   uma rota profunda.
4. Registre a URL do deployment e o commit publicado nesta documentação após a revisão.

## Rollback

1. Identifique o último commit conhecido como válido.
2. Execute o workflow manualmente selecionando esse commit/branch aprovado.
3. Confirme o novo deployment no ambiente `github-pages` e repita a validação HTTP.
4. Não apague o deployment defeituoso antes de registrar o commit, horário e sintoma.

## Portão de aprovação

Nenhum deploy de produção, push final ou exclusão do projeto remoto da Vercel deve ser
considerado aprovado somente porque o build local passou. A revisão do responsável pelo
repositório continua obrigatória.

## Registro da validação local — 2026-10-26

- `npm run build:github-pages`: aprovado.
- `npm run prepare:github-pages`: aprovado.
- `npm run check:github-pages`: aprovado.
- `npm run build`: aprovado.
- `npm test -- --watch=false`: 38 arquivos e 197 testes aprovados.
- `npm run check:white-label`: aprovado.
- `npx prettier --check` nos arquivos do workflow/scripts: aprovado.
- `git diff --check`: aprovado.
- Workflow remoto, URL pública, Actions Variables e rollback ainda não foram executados.
