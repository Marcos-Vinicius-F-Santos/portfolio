# Registro de Decisão — Escopo público das experiências

Data: 2026-09-25  
Status: Proposta para revisão de Marcos

## Contexto

A decisão geral `DECISAO-001-publicacao-nome-cargo-experiencias.md` permite publicar
nomes de empresas quando aprovados. A Spec da feature de portfólio público e conteúdo
administrável aprovada para esta entrega determina que os nomes das empresas não sejam
expostos na página pública.

## Decisão proposta

Para esta feature, a apresentação pública deve omitir o nome da empresa e exibir somente
o período, o cargo, o contexto, as responsabilidades, as decisões técnicas e os
resultados aprovados. O campo administrativo da empresa pode continuar persistido para
uso administrativo, mas não deve atravessar o contrato de apresentação pública.

Esta decisão é específica da feature e restringe o comportamento mais amplo permitido
pela DECISAO-001 sem remover o registro histórico da decisão anterior.

## Consequências

- O adaptador/DTO público não deve expor o campo de empresa.
- A área administrativa pode continuar editando o campo, sem publicá-lo.
- Uma futura feature que queira publicar empresas deverá revisar esta decisão e obter
  aprovação explícita de Marcos.

## Rollback

Remover o filtro do adaptador público somente após revisar a Spec da feature e atualizar
esta decisão. Não apagar o campo persistido nem alterar registros existentes durante o
rollback.
