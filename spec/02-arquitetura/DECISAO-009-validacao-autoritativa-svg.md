# Registro de Decisão — Validação autoritativa de uploads SVG

Data: 2026-09-26  
Status: Aceita — aprovada por Marcos em 2026-09-26.  
Spec: [Edição visual](../03-features/edicao-visual-rascunho-publicacao/spec.md).  
Decisão relacionada: [ADR-008](DECISAO-008-versionamento-publicacao-editorial.md).

## Contexto

A regra de produto aprovada preserva ícones PNG, JPEG e SVG até 1 MiB. A spec exige validar formato, tamanho e uso seguro antes de uma mídia entrar na publicação. O bucket e o catálogo SQL conseguem restringir MIME e tamanho declarado, mas não comprovam que os bytes de um SVG estão livres de scripts, eventos, `foreignObject`, URLs externas ou outros recursos executáveis.

A sanitização feita somente no navegador não é uma barreira de segurança, pois o cliente é controlado pelo solicitante. O PostgreSQL e as policies do Storage não leem nem analisam o conteúdo completo do objeto. A ADR-008 não acrescenta Edge Function; portanto habilitar SVG dinâmico exige uma exceção arquitetural explícita.

## Decisão

Adicionar uma única Supabase Edge Function estreita para validar e sanitizar novos SVGs enviados ao editor.

O fluxo será: reservar um caminho de quarentena privado e imutável; enviar o arquivo; reautorizar o administrador; baixar os bytes no ambiente servidor; aplicar limite de 1 MiB, parsing XML e allowlist estrita; rejeitar conteúdo ativo ou referência externa; gravar somente a saída sanitizada em outro caminho privado e imutável; calcular checksum; e marcar a mídia como pronta por uma operação controlada. A publicação aceita apenas o artefato sanitizado e nunca o objeto original da quarentena.

A função deve:

- validar o JWT e confirmar `auth.uid()` em `portfolio_admins`;
- usar segredo de servidor somente dentro da função, nunca no cliente, snapshot ou logs;
- aceitar somente o `media_id` reservado ao ator e à revisão esperada;
- rejeitar `script`, `foreignObject`, atributos `on*`, estilos executáveis, entidades/doctype, links e recursos externos; referências internas só serão aceitas pela allowlist;
- usar parser/sanitizador de versão fixada e manter corpus de SVGs válidos e maliciosos;
- produzir novo checksum e nunca promover o mesmo objeto não validado;
- permanecer idempotente e deixar a mídia em `pending` ou `rejected` diante de timeout, erro ou resultado ambíguo;
- não funcionar como proxy genérico, assinador de arquivos ou processador de outros formatos.

Os cinco SVGs locais existentes são tratados como `source=bundled`, versionados com a aplicação, e não passam pelo canal de upload. Até esta decisão ser aceita e verificada, novos SVGs permanecem bloqueados; PNG/JPEG continuam disponíveis para ícones.

## Alternativas consideradas

| Alternativa | Por que não |
| --- | --- |
| Confiar no MIME, extensão e tamanho do Storage | Não analisa os bytes nem remove conteúdo ativo. |
| Sanitizar somente no navegador | O cliente pode omitir ou alterar a sanitização antes do upload. |
| Validar o XML apenas em SQL | O banco não recebe os bytes do objeto pelo fluxo atual e não é o lugar adequado para parsing/sanitização de arquivos. |
| Servir o SVG original com outro cabeçalho | Não satisfaz o contrato de validar o conteúdo antes da publicação e mantém risco nos consumidores. |
| Converter todo SVG novo para PNG | É uma alternativa segura, mas deixa de preservar SVG como formato editável e pode alterar fidelidade e escala. |
| Bloquear SVG permanentemente | Reduz a superfície de ataque, porém contraria a preservação de formatos aprovada. Continua sendo o fallback enquanto esta ADR não for aceita. |
| Criar backend próprio | Amplia operação e credenciais além do necessário; uma função limitada junto ao Storage atende ao fluxo. |

## Consequências

A validação ocorre em ambiente confiável e o snapshot referencia somente mídia sanitizada. O fluxo ganha uma etapa assíncrona, dependência versionada, implantação de função e testes específicos de autorização, parser, timeout e idempotência. Uma falha na função impede SVG novo, mas não bloqueia PNG/JPEG nem assets empacotados.

A Edge Function passa a ser exceção limitada à declaração da ADR-008 de não criar serviço novo. Qualquer ampliação para transformação de imagens, assinatura genérica, antivírus de PDFs ou processamento de outros arquivos exige nova revisão arquitetural.

A aceitação desta ADR não aprova uma biblioteca específica nem habilita o formato antes dos testes. A implementação deve selecionar uma dependência mantida, fixar sua versão, revisar licenças e provar o corpus de segurança antes de liberar o formato.

## Verificação obrigatória

- SVG válido e mínimo é sanitizado e mantém apresentação esperada.
- Arquivos com `script`, eventos, `foreignObject`, entidades, CSS ativo, `javascript:`, `data:` e URLs externas são rejeitados.
- Arquivo com MIME/extensão falsos, acima de 1 MiB, malformado ou comprimido de forma inesperada é rejeitado.
- `anon`, autenticado não administrador e administrador tentando mídia/revisão alheia não conseguem validar.
- Retry não cria artefatos duplicados; timeout não marca mídia como pronta.
- O objeto de quarentena e o artefato sanitizado permanecem privados antes da publicação.
- Logs não contêm bytes, URL assinada, JWT ou segredo.

## Fontes técnicas

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Integração entre Edge Functions e Storage](https://supabase.com/docs/guides/functions/storage-caching)
- [Limites de upload do Supabase Storage](https://supabase.com/docs/guides/storage/uploads/file-limits)


