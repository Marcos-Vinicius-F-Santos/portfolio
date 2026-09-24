# Registro de Decisão — Classificação profissional ou pessoal dos projetos

Data: 2026-09-24  
Status: Aceita

## Contexto

A apresentação pública de projetos precisa separar projetos profissionais e pessoais
em subseções distintas. A tabela `portfolio_projects` já existe, mas ainda não possui
um atributo persistido que permita identificar essa classificação.

## Decisão

A classificação será persistida na coluna `project_type` da tabela
`portfolio_projects`, com os valores restritos a `professional` e `personal` por
constraint. A alteração será feita por migration versionada, sem valor padrão
inventado para registros existentes.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Hardcode do tipo no componente público | Impede a inclusão extensível de novos projetos e acopla conteúdo ao layout. |
| Mapa local separado do conteúdo persistido | Pode divergir do Supabase e não acompanha o ciclo administrativo do projeto. |
| Coluna `project_type` em `portfolio_projects` | Escolhida: mantém a classificação junto à entidade existente e permite validação por constraint. |

## Consequências

A página pública consegue agrupar projetos de forma determinística e novos projetos
podem receber a classificação no mesmo modelo persistido. A migration exige que
registros existentes sejam classificados antes de concluir; sem classificação
aprovada, a migration deve falhar em vez de inventar um valor. O rollback precisa
remover a coluna e a constraint somente depois que os consumidores forem retirados.
