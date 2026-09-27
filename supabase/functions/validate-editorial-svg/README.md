# Validação autoritativa de SVG

Esta função só aceita uma reserva `skill_icon` pertencente ao administrador e à revisão indicada. Ela baixa o objeto privado de quarentena, rejeita conteúdo ativo ou referências externas, serializa uma árvore SVG com allowlist, grava o artefato sanitizado em caminho privado e só então marca a mídia como `ready`.

O bucket continua sem `image/svg+xml` até o corpus de segurança ser executado no runtime Edge. A função não deve receber segredos no corpo ou registrar bytes, tokens ou URLs assinadas.
