# Schema e contrato propostos — Edição visual

Status: Contrato do snapshot v1 aprovado pela ADR-008; schema físico sujeito à revisão das migrations; nenhum DDL aplicado.
Relacionado: [ADR-008](../../02-arquitetura/DECISAO-008-versionamento-publicacao-editorial.md).
Escopo: um portfólio, um administrador e um rascunho. Não preparar multi-tenancy.

## Estruturas

Todas em `portfolio_editorial`, schema não exposto; RLS e sem DML direto dos clientes.

| Tabela | Chave e campos principais | Invariantes |
| --- | --- | --- |
| draft | id singleton, revision bigint, base_publication_id FK, updated_at | revision crescente; todas as mutações bloqueiam esta linha |
| draft_entities | id text, kind, parent_id FK opcional, position integer, data jsonb | kind em catálogo fechado; posição única por coleção; data somente campos estruturados daquele tipo |
| draft_translations | entity_id FK, locale FK, fields jsonb | PK composta; somente campos traduzíveis autorizados |
| draft_locales | code PK, label, direction, active, position | pt-BR obrigatório; direção ltr nesta fase |
| technologies | id text PK, label, aliases, bundled_asset, license_reference | catálogo único; versão/nome exibido separados do ID |
| draft_media_refs | entity_id FK, field, media_id FK, position | uma associação por alvo/slot; currículo por locale; sem URL assinada |
| media | id UUID, source, bucket, path, mime, bytes, checksum, status, unreferenced_since | source managed/legacy_public/bundled/external; managed pronto antes de publicar; bucket/path único |
| publications | id UUID PK, sequence única, format_version, snapshot jsonb, hash, created_at, source_revision, retained | payload imutável; hash calculado no servidor; somente snapshots validados |
| publication_media_refs | publication_id FK, media_id FK | conjunto exato derivado do snapshot; índice reverso por media_id |
| publication_access | publication_id FK, public_until | acesso público para atual ou retirada há menos de 30 min; retenção não implica acesso público |
| site_state | id singleton, active_publication_id FK, editorial_enabled | linha bloqueada na publicação; ID ativo nunca aponta para revisão inválida |
| operations | operation_id UUID, actor_id, type, request_hash, revision, result_publication_id, result | chave única; mesma chave com outro conteúdo retorna conflito, não reutiliza resultado |
| media_cleanup | media_id FK, state, lease_until, attempts, last_error_code | claim transacional; mídia em remoção não recebe novas associações |

Usar IDs textuais preserva UUIDs existentes e IDs locais como `data-science`. Prefixar apenas novos IDs que colidam entre domínios; mapa de migração mantém rota dos projetos. Parent/coleção exigem validação de domínio: skill em categoria, item de lista em entidade/campo, imagem em projeto; não aceitar ciclos.

As listas de responsabilidades, decisões, resultados, aprendizados e competências tornam-se itens com ID e posição; traduções referenciam esses IDs, não o índice. Elementos omitidos do rascunho não entram no snapshot. Reordenar um grupo usa uma operação com lista completa dos IDs atuais, valida igualdade do conjunto e aplica posições em uma transação.

Na implementação do contrato v1, esses itens usam `kind=listItem`, `parentId` e `data.collection`; cada tradução possui o campo `text`. Rótulos públicos do catálogo usam `kind=interfaceText`, `data.key` e tradução `text`. Essa especialização foi aprovada por Marcos durante a T-007 para evitar concatenar listas ou perder as 61 chaves existentes.

## Snapshot v1

Contrato estrutural (não é exemplo de conteúdo a publicar):

```text
{
 formatVersion: 1,
 publicationId, createdAt, defaultLocale: "pt-BR",
 locales: [{ code, label, direction, position }], // somente ativos
 sections: [{ id, kind, position }],
 entities: { [id]: { kind, parentId, position, data } },
 translations: { [locale]: { [entityId]: { [field]: text } } },
 technologies: { [id]: { label, iconMediaId, aliases } },
 media: { [id]: { source, mime, bytes, assetPath? } }
}
```

Snapshot público não inclui idiomas em preparação, drafts, IDs de usuário, diagnóstico de operações, nomes internos de empresa não divulgáveis ou campos administrativos. Caminhos privados são resolvidos por media_id através do serviço; URLs assinadas nunca são persistidas. Dados editoriais em preparação ficam no rascunho. Na restauração, idiomas ainda em preparação são substituídos conforme confirmação de descarte, não recuperados de um snapshot que não os continha.

Separar JSON Schema do formato e regras de negócio. JSON Schema versionado no domínio de conteúdo; validação SQL equivalente/conferida por corpus de casos. Não pressupor extensão pg_jsonschema instalada; só adotá-la após verificar disponibilidade. Campos desconhecidos são rejeitados no escritor, não silenciosamente publicados.

## RPCs e comandos

| Operação | Entrada essencial | Resultado / erro |
| --- | --- | --- |
| get_editor_draft | sessão autorizada | revisão, entidades e traduções privadas |
| save_editor_command | expected_revision, operation_id, comando tipado | nova revisão e confirmação; conflito preserva original |
| validate_editor_publication | expected_revision | lista de erros por entidade/campo/locale; hash do resumo |
| publish_editor_draft | expected_revision, operation_id, review_hash | publication_id; repetição devolve mesmo ID |
| get_published_snapshot | versão opcional | ativa ou versão com janela válida; nunca histórico privado |
| discard_editor_draft | expected_revision, operation_id | reconstitui ativa como nova revisão |
| restore_editor_publication | retained_publication_id, expected_revision, operation_id | converte para rascunho; não publica |
| get_public_media_reference | media_id, publication_id | bucket/path apenas se associação pública válida |
| prepare/finalize_editor_media | alvo, revisão, operação, metadados | reserva upload único e confirma disponibilidade |
| claim/finalize_media_cleanup | lote autorizado/claim | marca removível e confirma resultado da API Storage |

Comandos aceitos: set_field, set_translation, add_entity, remove_entity, reorder_collection, set_locale, attach_media e detach_media. Nunca aceitar SQL, caminho JSON livre sem allowlist ou snapshot pronto do navegador. Desfazer/refazer usa comandos inversos, valida revisão e relações novamente; remover/restaurar associação não remove binário imediatamente.

## Validação de publicação

1. Autorizar administrador; procurar operation_id já concluído antes de comparar revisão.
2. Bloquear draft e site_state; bloquear mídias associadas em ordem de ID para evitar deadlock.
3. Comparar revisão e review_hash; rejeitar se mudou depois da revisão humana.
4. Validar cardinalidade, campos por kind, tipos, IDs, parents, posições e links seguros.
5. PT-BR completo, idiomas ativos completos em campos obrigatórios/rótulos; não incluir preparação. PDFs são opcionais por idioma, inclusive ausência atual preservada.
6. Exigir arquivo managed pronto, MIME/tamanho corretos e associação existente; rejeitar deleting/pending. Uploads precisam estar finalizados, não apenas constar no cliente.
7. Construir snapshot só dos dados públicos, validar formato e hash, inserir referências, apontar ativa, registrar operation_id e revisão na mesma transação.
8. Marcar retirada da versão anterior com public_until = now + 30 min. Reter dez versões para restauração; adiar purga se uma versão ainda estiver na janela pública.
9. Nenhuma chamada Storage de rede dentro da transação. Existência conferida na finalização de upload; impedir deleção concorrente por status/claims. Remoção externa fora do fluxo vira incidente, não garantia absoluta de disponibilidade.

Publicar sem mudança de hash não cria outra versão. Operações de publicação permanecem como recibos compactos mesmo após expirar o snapshot retido: repetição nunca recria uma publicação antiga. Autosave usa fila por sessão, sem aceitar confirmação antiga sobre estado novo.

## Segurança e testes de contrato

Papéis anônimo e autenticado não autorizado sem escrita, leitura privada ou EXECUTE nas mutações efetivas. RLS também no schema privado para o papel executor limitado; exceção definer detalhada no ADR. Testar chamadas diretas às tabelas, wrapper, helpers e Storage. Não conceder TRUNCATE, REFERENCES, TRIGGER ou UPDATE livre de payload publicado. Imutabilidade por ACL e trigger que rejeita UPDATE de payload; manutenção altera apenas tabelas de acesso/retention e purge controlada.

Migration futura deve criar primeiro estrutura e validações; importar depois; ativar ao fim. Este documento não é uma migration executável.

