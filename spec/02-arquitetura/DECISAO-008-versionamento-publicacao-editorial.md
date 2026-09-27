# Registro de Decisão — Versionamento e publicação editorial

Data: 2026-09-26
Status: Aceita — aprovada por Marcos em 2026-09-26.

A aprovação inclui o contrato do snapshot v1: `formatVersion: 1`, payload imutável, gerado e validado no servidor, sem dados administrativos, traduções inativas ou URLs assinadas. O DDL continua sujeito à revisão de cada migration; a aprovação desta decisão não afirma implementação.
Spec: [Edição visual](../03-features/edicao-visual-rascunho-publicacao/spec.md).
Schema: [Contrato proposto](../04-plano/edicao-visual-rascunho-publicacao/schema-proposto.md).

## Contexto

A publicação imediata atual não atende ao rascunho privado aprovado. Atualizações em múltiplas tabelas não garantem uma revisão pública consistente. Storage não participa da transação SQL. O inventário real mostrou três buckets públicos sem objetos e conteúdo parcialmente local. A edição deve ser introduzida sem apagar conteúdo, ampliar permissões ou inventar traduções.

## Decisão

Manter Angular e Supabase, com rascunho por entidades e traduções, snapshots publicados imutáveis e uma referência ativa promovida por transação. O visitante fixa uma versão durante navegação interna; arquivos novos são privados, ligados por ID, com acesso condicionado a publicação. Não acrescentar servidor próprio ou Edge Function nesta proposta.

### Limites e componentes

- Editor visual em `features/admin/visual-editor/`, com comandos de campo/lista/ordenação e estado de revisão.
- Serviços editoriais em `features/admin/content-management/`; mídia em `media-management/`.
- Leitura de snapshot e catálogo de tecnologias em `features/portfolio/content/`.
- Apresentação pública reutilizada para preview, sem cliente de escrita ou rascunho injetado no visitante.
- `/admin` continua entrada; formulários antigos saem do fluxo de escrita no corte. Mantê-los no histórico Git, não como caminho alternativo em produção.
- Navegação interna passa a manter uma versão em memória; links diretos/reload resolvem a versão atual. Não usar um parâmetro de URL para autorizar leitura privada.

### Autoridade e transações

Schema privado `portfolio_editorial` não exposto ao Data API. Tabelas sem grants diretos a anon/authenticated e com RLS. RPCs públicas mínimas `SECURITY INVOKER` delegam a funções internas controladas. As mutações internas precisam de privilégio delegado para escrever onde o chamador não tem DML; usar proprietário NOLOGIN/NOBYPASSRLS, de menor privilégio e diferente do dono das tabelas, funções `SECURITY DEFINER` apenas no schema não exposto, search_path fixo/vazio e nomes qualificados. Cada entrada administrativa verifica `auth.uid()` em `portfolio_admins`; nenhuma autorização depende de user_metadata.

Revogar EXECUTE de PUBLIC/anon nas mutações, conceder somente as assinaturas necessárias a authenticated; schema USAGE não significa exposição REST. Helpers de leitura pública só retornam snapshots ativos/ou dentro da janela de navegação e referências públicas; nunca retornam rascunho ou histórico privado. Revisar proprietário, ACL, RLS e wrappers com testes negativos. A exceção de privilégio é deliberada para centralizar invariantes, não para contornar um erro de permissão.

Toda mutação bloqueia o cabeçalho do rascunho, compara revisão e aplica um comando atômico com operation_id. Publicar revalida a revisão, verifica mídias prontas, gera snapshot a partir do banco (não aceita snapshot arbitrário do browser), calcula hash e promove na mesma transação. Permissões diretas nas tabelas antigas serão revogadas no corte, sem restaurar grants excessivos em rollback.

### Versionamento do contrato

Snapshot `formatVersion: 1`, independente da revisão do rascunho e do ID da publicação. Campos e coleções de tipo conhecido; tradução por entidade/idioma. Novas versões incompatíveis exigem leitor/migrador antes do escritor. Histórico nunca é reescrito: restauração converte formato antigo suportado para rascunho atual. Formato desconhecido bloqueia publicação/restauração com erro explícito. Validação tipada no cliente para feedback e validação autoritativa no banco antes de promover.

### Mídias e cache

Detalhes: [Acesso e ciclo de vida](../04-plano/edicao-visual-rascunho-publicacao/midias-e-cache.md). Não copiar arquivo inédito para bucket público para publicar. RLS em Storage consulta associação autorizada; URLs assinadas são credenciais temporárias e não integram snapshots. Guarda do arquivo anterior permite restaurar versões. SQL não remove binários; limpeza usa a API Storage em fluxo separado, coordenado por estado e bloqueios.

## Alternativas consideradas

| Alternativa | Por que não |
| --- | --- |
| Um JSON gigante mutável a cada tecla | Autosave pesado e conflitos; perde granularidade e validação por entidade |
| Duplicar todas as tabelas por versão | Complexidade desnecessária para leitura de um portfólio pequeno |
| Publicar várias chamadas do browser | Permite estado parcialmente publicado e inconsistência entre consultas |
| Copiar para bucket público antes da promoção | Expõe arquivos inéditos antes de publicar; cópia depois da promoção cria janela de referências indisponíveis |
| Conceder DML direto para permitir RPC invoker | Permite contornar revisão/validação e imutabilidade |
| Backend próprio | Não necessário para esta escala; funções SQL e políticas bastam para autorização proposta |

## Consequências

Snapshots duplicam pouco texto, simplificam rollback de conteúdo e coerência. Exigem schema validado, migração de formatos e retenção. Um rascunho serializa edições: conflitos são explícitos, sem merge automático. Assinaturas de mídia têm expiração, custo de renovação e não equivalem a revogação instantânea. Referências devem incluir versões retidas e a janela pública de navegação antes da coleta de lixo.

## Migração e rollback

Inventariar novamente antes do corte; exportar backup protegido; comparar primeira versão com o conteúdo efetivo. Desativar escrita antiga antes da importação final e promoção. Leitor novo deve entrar antes do editor; banco aditivo antes do leitor. Falha no corte mantém a versão anterior e escrita suspensa. Depois do corte, rollback usa frontend compatível com snapshots e preserva dados privados; não reabrir escrita legada nem apagar histórico. Detalhes em plano.md.

## Relação com decisões anteriores

Substitui, quando implantada, publicação imediata das DECISAO-004/007 e remoção imediata de mídia anterior da DECISAO-005. Preserva PDF da DECISAO-003, classificação da DECISAO-002 e confidencialidade da DECISAO-006. Documentos antigos recebem notas explícitas de precedência, sem apagar decisões históricas.

## Fontes técnicas consultadas

- [Funções Supabase](https://supabase.com/docs/guides/database/functions): privilégios e funções.
- [Storage e assinaturas](https://supabase.com/docs/guides/storage/serving/downloads): URLs assinadas duram até expirar; trocar chaves Auth não as revoga.
- [RLS PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html): RLS não controla TRUNCATE/REFERENCES.


