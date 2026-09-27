# Registro de Decisão — Contrato dos currículos em PDF

> **Precedência para a evolução editorial (2026-09-26):** Preserva MIME PDF e um currículo por idioma; a nova política aprovada permite ausência de PDF, sem link enganoso, e idiomas adicionais. O inventário encontrou zero PDFs e nenhum limite específico no bucket; não tratar a exigência histórica de dois PDFs como estado atual. Ver [ADR-008](DECISAO-008-versionamento-publicacao-editorial.md). Esta nota preserva o histórico; não afirma que a evolução já foi implementada.

Data: 2026-09-24  
Status: Aceita

## Contexto

A feature de habilidades, formação e contato deve disponibilizar exatamente dois
currículos: um em português brasileiro e outro em inglês. A tabela
`public.portfolio_files` e o bucket `curricula` já existem, mas o schema atual não
restringe o MIME dos currículos a PDF.

## Decisão

Os registros de currículo continuarão usando `public.portfolio_files`, com no máximo um
registro por locale pela restrição única existente. O banco e o bucket `curricula` devem
aceitar somente `application/pdf`; a presença dos dois arquivos será verificada no gate
de entrega, não imposta por uma constraint de cardinalidade que impediria o estado
temporário anterior ao upload.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Manter qualquer MIME e validar somente no frontend | Permite uploads inválidos no Storage e deixa o contrato de dados inconsistente |
| Criar uma nova tabela ou bucket para esta feature | Duplica estruturas já existentes e cruza o limite arquitetural sem necessidade |
| Exigir os dois registros por constraint ou trigger | Impede a criação ou substituição gradual dos arquivos e não é necessário para a leitura pública |

## Consequências

O Storage e o banco rejeitarão currículos que não sejam PDFs, tornando o contrato mais
previsível para o download público. A migration precisa auditar registros existentes e
possui rollback para remover a restrição. A existência dos dois arquivos continua sendo
uma condição operacional da entrega, e o estado sem arquivo deve permanecer seguro para
permitir upload posterior.
