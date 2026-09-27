# Registro de Decisão — Conteúdo administrativo persistido

> **Precedência para a evolução editorial (2026-09-26):** A escrita direta pública é substituída por comandos em rascunho e publicação explícita no corte; persistência de conteúdo permanece. Ver [ADR-008](DECISAO-008-versionamento-publicacao-editorial.md). Esta nota preserva o histórico; não afirma que a evolução já foi implementada.

Data: 2026-09-25  
Status: Aceita para implementação

## Contexto

A área administrativa precisa adicionar e editar textos, resultados, experiências,
projetos, habilidades, formação e contatos. As tabelas de textos, experiências e
projetos já existem no Supabase, mas habilidades, formação e contatos ainda são
catálogos constantes em `src/app/features/portfolio/content/portfolio-content.ts`.

Sem uma fonte persistida para esses catálogos, a edição administrativa não poderia
atender ao contrato aprovado sem alterar o código a cada mudança.

## Decisão

- Reutilizar `portfolio_texts` e `portfolio_text_translations` para textos e resultados
  representados pelas chaves públicas existentes.
- Reutilizar `portfolio_experiences` e `portfolio_experience_translations` para
  experiências.
- Reutilizar `portfolio_projects` e `portfolio_project_translations` para projetos,
  mantendo `project_type`, `display_order`, links e sem incluir imagens nesta feature.
- Criar estruturas relacionais versionadas por migration para categorias/habilidades,
  formação acadêmica e contatos, com traduções separadas por locale quando houver texto.
- Manter os catálogos locais como fallback até a leitura persistida ser verificada; depois
  disso, a página pública poderá preferir os valores persistidos sem perder o fallback.
- A gestão será feita somente por `insert` e `update` autenticados e autorizados por
  `public.portfolio_admins`; não haverá `delete` nesta feature.
- O log de falha será simples e observável no primeiro momento, sem criar uma tabela de
  auditoria ou infraestrutura de monitoramento específica para este portfólio.

## Consequências

A área administrativa pode gerenciar os sete tipos de conteúdo sem criar backend próprio
ou duplicar a camada de conteúdo. A migration aumenta o contrato do banco e precisa de
RLS, grants e rollback revisados. O fallback local reduz o risco de a página pública
ficar vazia durante a transição.

## Alternativas consideradas

| Alternativa                                                          | Por que não                                                                    |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Manter habilidades, formação e contatos somente em constantes locais | Impede adição/edição sem alterar código e não atende FR-001 a FR-004           |
| Usar somente `portfolio_texts` para todos os tipos                   | Não representa adequadamente categorias, ordem, símbolo e destino dos contatos |
| Criar CMS ou backend próprio                                         | Cruza os limites da arquitetura e é desnecessário para um portfólio simples    |
| Criar log persistido e monitoramento dedicado                        | Aumenta a complexidade sem requisito de auditoria histórica nesta fase         |

## Rollback

Remover a preferência pelos registros persistidos e restaurar o uso dos catálogos locais
antes de reverter a migration. A migration reversa só deve ser aplicada depois de
confirmar que nenhum consumidor depende das novas tabelas; ela remove as estruturas e
policies criadas por esta decisão.
