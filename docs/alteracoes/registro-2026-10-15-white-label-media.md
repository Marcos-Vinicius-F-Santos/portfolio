# Registro de alterações — White-label, mídia de perfil e apresentação

Data: 15/10/2026  
Escopo: refatoração de identidade, suporte à foto de perfil no Supabase Storage e ajustes da apresentação local.

Este registro complementa os documentos históricos desta pasta. Credenciais, chaves privadas e conteúdo sensível não são registrados aqui.

## Alterações realizadas

### Identidade e apresentação

- O código deixou de depender de arquivos pessoais nomeados para identidade do perfil.
- Foi criado o avatar neutro versionado em `src/assets/profile/avatar-generic.svg`.
- A identidade passou a aceitar configuração em runtime:
  - `PORTFOLIO_AUTHOR_NAME`
  - `PORTFOLIO_PROFILE_ID`
  - `PORTFOLIO_PROFILE_IMAGE_URL`
- A precedência da apresentação ficou:
  1. configuração de runtime;
  2. identidade do snapshot publicado;
  3. avatar genérico.
- Para a apresentação local, `PORTFOLIO_AUTHOR_NAME` foi configurado como `Marcos Santos`, fazendo o título exibir apenas o nome. O subtítulo e a descrição permanecem separados.
- A URL da foto foi configurada em `.env.local`, que é ignorado pelo Git. O arquivo `public/runtime-config.js` é gerado automaticamente e também não deve ser versionado.

### Foto de perfil

- A tela administrativa de mídias recebeu seleção e envio de foto de perfil.
- A foto foi enviada para o bucket público isolado da instância:
  - bucket: `editorial-profile-images`
  - limite: 3 MB
  - formatos: PNG, JPG/JPEG e WebP
- O arquivo enviado foi associado ao perfil editorial pelo campo `profileImage`.
- A apresentação local foi recarregada e validada visualmente com a foto real, substituindo o avatar genérico.

### Artefatos genéricos

- Foram atualizados os scripts de geração do snapshot e do runtime para usarem configuração neutra.
- Referências operacionais específicas de pessoa foram removidas ou substituídas por artefatos genéricos nos fluxos consumidos por código, build e deploy.
- O catálogo, o adapter do snapshot, o validador e os testes foram ajustados para aceitar a entidade editorial `profile` e mídia gerenciada.

## Migrations aplicadas

As migrations abaixo foram aplicadas na instância Supabase conectada:

1. `20261015100000_add_profile_media_support.sql`
   - cria/configura o bucket `editorial-profile-images`;
   - adiciona o tipo de entidade `profile`;
   - adiciona `profile_image` e `profileImage` às regras de mídia;
   - atualiza a reserva, associação e montagem da publicação.
2. `20261015110000_add_profile_entity_to_existing_draft.sql`
   - cria a entidade `profile` em drafts antigos;
   - preserva o `profileId` neutro `profile-generic`;
   - cria traduções vazias para os locales ativos.
3. `20261015113000_allow_profile_media_constraints.sql`
   - atualiza as constraints antigas de bucket e propósito para aceitar mídia de perfil.
4. `20261015120000_fix_profile_media_association.sql`
   - tenta corrigir a ambiguidade entre parâmetros PL/pgSQL e colunas SQL na associação de mídia.
5. `20261015123000_fix_profile_media_conflict_target.sql`
   - consolida a correção final da associação;
   - usa `ON CONFLICT ON CONSTRAINT draft_media_refs_pkey` para evitar nova ambiguidade no upsert.

## Percalços e correções da migration

### 1. Upload rejeitado pelas constraints antigas

O schema original aceitava somente os buckets e propósitos de projetos, ícones e currículos. A primeira tentativa de upload de perfil falhou porque `editorial-profile-images` e `profile_image` ainda eram rejeitados pelas constraints existentes.

Correção: a migration `20261015113000_allow_profile_media_constraints.sql` remove e recria `media_bucket_check` e `media_purpose_check` incluindo os valores de perfil.

### 2. Erro de referência ambígua no PostgreSQL

Depois da correção das constraints, a associação falhou com erro semelhante a:

```text
column reference "entity_id" is ambiguous
```

O nome dos parâmetros da função coincidia com nomes de colunas usados no `INSERT ... ON CONFLICT`. A migration intermediária qualificou os parâmetros com o nome da função, mas o alvo do conflito ainda mantinha uma referência problemática.

Correção final: usar o nome explícito da constraint da chave primária no `ON CONFLICT`, além de qualificar parâmetros e colunas nas consultas da função.

### 3. Publicação bloqueada por dados editoriais antigos

O upload e a associação da mídia passaram a funcionar, mas a revisão de publicação encontrou quatro itens de lista antigos sem tradução em PT/EN. Esses itens pertencem a responsabilidades/resultados legados e não foram alterados automaticamente para evitar modificar conteúdo não solicitado.

Enquanto esses blockers permanecerem, o snapshot publicado não incorpora a nova entidade de perfil. Para a validação local, a URL da imagem foi aplicada via runtime config, respeitando a precedência definida para a identidade.

### 4. Tentativas de upload

As tentativas anteriores deixaram três objetos duplicados sem referência editorial no Storage. Eles não são usados pela aplicação; a limpeza foi mantida pendente para ser feita com identificação e remoção explícitas, sem apagar arquivos potencialmente válidos por engano.

## Verificações

- Upload confirmado no Supabase Storage com resposta HTTP 200 para o objeto final.
- Associação confirmada em `draft_media_refs` para `entity_id = profile` e `field = profileImage`.
- Apresentação local validada visualmente em `http://127.0.0.1:4300/`.
- Título validado como `Marcos Santos`.
- Suíte de testes executada com sucesso: 35 arquivos e 180 testes aprovados.

## Estado atual

- A foto está armazenada no Supabase Storage e visível na execução local.
- A imagem ainda não está presente no snapshot público publicado enquanto os quatro blockers editoriais não forem resolvidos.
- Nenhuma credencial foi adicionada a este registro ou versionada.
