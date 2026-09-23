# Evidências — Integração com Supabase

Data da verificação: 2026-09-23  
Projeto: `portfolio-profissional`  
Project ref: `jjndvtjhxutuerwvjocy`  
Região: `sa-east-1`

## Aplicação e estrutura

- Migrations registradas no remoto:
  - `20260923194714_create_portfolio_content`
  - `20260923200309_restrict_portfolio_grants`
- As tabelas de conteúdo, traduções, experiências, projetos, imagens, arquivos e
  allowlist administrativa existem no schema `public`.
- Todas as tabelas de portfólio estão com RLS habilitado.
- Os advisors de segurança foram verificados após o vínculo do administrador. No estado
  atual, há um aviso de nível WARN sobre proteção contra senhas comprometidas desativada;
  não há alerta de RLS/Storage.
- Os buckets públicos existem:
  - `project-images`: limite de 1 MiB e MIME `image/png`/`image/jpeg`.
  - `curricula`: bucket separado, sem a restrição de imagem desta feature.

## Policies e privilégios

- Leitura pública está definida para o papel `anon`.
- Depois da migration complementar, `anon` possui `SELECT` e não possui `INSERT`
  em `portfolio_texts`; as demais tabelas seguem o mesmo padrão.
- `authenticated` possui `SELECT`, `INSERT` e `UPDATE` nas tabelas de conteúdo,
  mas as policies só permitem escrita quando `auth.uid()` está presente em
  `public.portfolio_admins`.
- Storage permite leitura pública e restringe upload/atualização à mesma allowlist.
- A allowlist contém o usuário administrador de Marcos; a escrita autenticada foi
  verificada em transação reversível.

## Aplicação

- `npm run build`: passou.
- `npm test -- --watch=false --no-progress`: passou — 7 arquivos, 58 testes.
- Os testes do serviço cobrem consulta de texto, seleção de idioma, relação projeto
  → N imagens, resposta vazia, falha de rede e ausência de configuração.
- O arquivo gerado `public/runtime-config.js` não é versionado e não contém valores
  reais no repositório.

## Verificações transacionais

- Leitura como `anon`: passou, retornando a tabela pública sem autenticação.
- Escrita como o administrador configurado: passou e foi revertida com `ROLLBACK`.
- Escrita como `anon`: negada por privilégio/RLS.
- Imagem com `size_bytes = 1048577`: rejeitada pela constraint da tabela e revertida.

## Limitações desta rodada

- Não foram inseridos dados de conteúdo ou arquivos reais; a validação usa schema,
  policies, configuração de buckets, transações reversíveis e fixtures de teste.
- O upload HTTP real de uma imagem inválida ainda não foi executado.
- Não foi executado deploy.