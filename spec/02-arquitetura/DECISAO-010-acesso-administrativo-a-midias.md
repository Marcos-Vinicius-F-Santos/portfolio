# Registro de Decisão — Acesso administrativo ao gerenciamento de mídias

Data: 2026-09-27  
Status: Aceita — aprovada por Marcos em 2026-09-27.  
Spec: [Edição visual com rascunho e publicação](../03-features/edicao-visual-rascunho-publicacao/spec.md).

## Contexto

O projeto já possui `MediaManagement`, com controles para imagens de projetos, ícones de Skills e currículos. A rota administrativa só expunha o editor visual, deixando esses controles inacessíveis no modo admin.

## Decisão

Expor o componente existente em uma rota protegida `/admin/media`, reutilizar seu serviço e adicionar links a partir do workspace e do editor visual. Não será criada uma segunda tela ou um segundo fluxo de upload.

O acesso continuará protegido pelo mesmo `adminAuthGuard`. A tela manterá os limites, MIME types, policies e regras de publicação já existentes.

## Consequências

O administrador terá um ponto explícito para enviar e substituir imagens de projetos, ícones de Skills e currículos. O fluxo continua separado do conteúdo textual, mas acessível dentro do modo admin. A decisão não altera o formato do snapshot nem libera SVG fora das validações já aprovadas.

## Verificação

- `/admin/media` exige autenticação administrativa.
- O workspace e o editor visual apontam para a rota.
- Os controles existentes de projeto, Skill e currículo permanecem disponíveis.
- Build e testes Angular passam.
