# Rollback — Refatoração white-label e isolamento por perfil

Este procedimento restaura a versão anterior da aplicação sem apagar objetos do
Storage. A migração de perfil é aditiva e não remove dados existentes.

## Aplicação

1. Publique o bundle anterior no provedor de hospedagem ou reverta a implantação
   para a última versão validada.
2. Restaure, se necessário, o snapshot publicado anterior usando o `publicationId`
   registrado antes da implantação. Não sobrescreva o objeto atual do Storage.
3. Reponha as variáveis `PORTFOLIO_AUTHOR_NAME`, `PORTFOLIO_PROFILE_ID` e
   `PORTFOLIO_PROFILE_IMAGE_URL` da implantação anterior. Se a imagem não estiver
   disponível, deixe `PORTFOLIO_PROFILE_IMAGE_URL` vazio para ativar o avatar neutro.
4. Limpe o cache/CDN e confirme a página pública, idioma padrão, projetos e contato.

## Banco e Storage

- Não excluir `editorial-profile-images` nem os objetos nele contidos durante o
  rollback. Eles podem ser reutilizados pela próxima implantação.
- Se a migração ainda não tiver sido aplicada, basta interromper a aplicação; não há
  objetos de perfil para desfazer.
- Se for necessário voltar o schema em um ambiente descartável, execute uma migração
  compensatória aprovada pelo DBA que remova somente o suporte `profile_image`, a
  associação `profileImage` e o bucket criado pela migração. Faça isso apenas depois
  de garantir que nenhum snapshot ativo referencia essa mídia.
- Em produção, prefira manter a migração e reverter apenas o bundle/configuração. Isso
  evita perda de histórico e preserva os arquivos do Storage.

## Verificação pós-rollback

```powershell
npm run check:white-label
npm test -- --watch=false --no-progress
npm run build
```

O resultado esperado é a renderização do snapshot anterior ou do fallback neutro,
sem carregamento de identidade de outra instância.
