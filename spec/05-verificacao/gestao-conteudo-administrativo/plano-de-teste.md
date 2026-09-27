# Plano de teste — Gestão de conteúdo pela área administrativa

Status: Rascunho — evidências pendentes de execução manual com Supabase autorizado

## Verificações automatizadas

- `npm test -- --watch=false --no-progress`
- `npm run build`

## Verificações de unidade e integração

- Serviço administrativo salva uma chave pública nas duas traduções.
- Serviço administrativo retorna falha sem sucesso falso quando a persistência é recusada.
- Formulários exibem a mensagem padrão para campos obrigatórios vazios.
- Catálogos persistidos de habilidades, formação e contatos são mapeados para a leitura
  pública.
- Migration habilita RLS, concede leitura pública e restringe insert/update ao
  administrador autorizado.

## Verificação manual prioritária

1. Autenticar Marcos em `/admin`.
2. Adicionar ou editar um texto/resultado existente em português e inglês.
3. Recarregar a página pública e conferir as duas versões.
4. Adicionar ou editar experiência e projeto, alterar a ordem e conferir a página
   pública.
5. Adicionar ou editar habilidade, formação e contato, alterar a ordem quando aplicável
   e conferir a página pública.
6. Tentar salvar um formulário incompleto e conferir a mensagem padrão.
7. Simular indisponibilidade/recusa do Supabase e conferir falha sem publicação falsa.
8. Confirmar que visitante não autenticado continua sem escrita.

## Evidências a anexar

- Saída dos testes automatizados.
- Saída do build.
- Resultado da aplicação da migration e verificação das policies.
- Evidência da conta autorizada de Marcos.
- Capturas ou roteiro preenchido dos fluxos administrativo e público.
