# Registro de Decisão — Editor completo de projetos e catálogo compartilhado de Skills

Data: 2026-09-27  
Status: Aceita — aprovada por Marcos em 2026-09-27.  
Spec: [Edição visual com rascunho e publicação](../03-features/edicao-visual-rascunho-publicacao/spec.md).

## Contexto

O editor visual permite alterar o resumo dos projetos, mas o detalhe completo ainda abre como página pública. As tecnologias também podem ser selecionadas por IDs, porém não há uma tela administrativa para criar uma tecnologia com ícone e reutilizá-la entre projetos e Habilidades.

## Decisão

Adicionar uma rota protegida de detalhe administrativo para editar todos os campos traduzíveis e estruturados do projeto no mesmo rascunho. As tecnologias serão mantidas no catálogo `portfolio_editorial.technologies`; o projeto e as entidades de Skill referenciarão o mesmo ID. A criação de uma tecnologia exigirá nome, ID estável e ícone PNG/JPEG/SVG validado pelo fluxo de mídia.

## Consequências

Uma Skill criada no catálogo compartilhado poderá ser selecionada em qualquer projeto e
adicionada à seção Habilidades sem duplicar o registro. A criação e a edição foram
posteriormente centralizadas no Gerenciador de mídias pela ADR-012; o detalhe de projeto
permanece apenas como seletor. O detalhe administrativo usa as RPCs revisionadas
existentes, preservando publicação, undo/redo e validação.

## Verificação

- O link “Ver projeto completo” no modo admin abre o detalhe administrativo.
- Campos textuais e listas do projeto salvam no rascunho por idioma.
- A lista de tecnologias usa o catálogo compartilhado.
- Uma tecnologia existente pode ser selecionada no projeto e em Habilidades; a criação e
  a troca do ícone acontecem no Gerenciador de mídias.
- A rota pública permanece somente leitura.
