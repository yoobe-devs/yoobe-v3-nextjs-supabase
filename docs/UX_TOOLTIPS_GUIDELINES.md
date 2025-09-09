# UX Guidelines – Tooltips vs. Texto Auxiliar

Objetivo: padronizar quando utilizar Tooltips e quando utilizar texto auxiliar (inline/help text) na interface para manter consistência, clareza e acessibilidade.

## Quando usar Tooltip
- Ações com ícone ou rótulo curto que precisam de contexto:
  - Ex.: Sync, Replicar, Submeter, Copiar SKU.
- Controles densos onde o espaço é limitado:
  - Ex.: seleção/paginação (selecionar página, selecionar visíveis, anterior/próxima, itens por página).
- Explicações rápidas em títulos/cards/indicadores:
  - Ex.: “Total Disponível” (físico + virtual − reservado), “Estoque Baixo” (available < threshold), “Sem Estoque”.
- Campos de formulários que são familiares, mas com exemplos úteis:
  - Ex.: campo “Motivo” com exemplos “Campanha X, acerto de estoque, devolução”.

Regras de estilo:
- Mensagens curtas e precisas (máx. 8–12 palavras quando possível).
- Evitar frases longas ou parágrafos em Tooltips.
- Preferir ícone HelpCircle (ou similar) ao lado do título/label.
- Acessibilidade: fornecer aria-label quando o botão não possui texto visível.
- Evitar Tooltips em elementos desabilitados (envolver em container se necessário).

## Quando usar Texto Auxiliar (inline)
- Informação crítica ao sucesso da tarefa ou segurança:
  - Ex.: efeitos colaterais de uma ação, requisitos obrigatórios.
- Regras, pré‑requisitos e validações que precisam estar sempre visíveis:
  - Ex.: política de replicação, permissões necessárias, formatação de campos.
- Formulários longos/complexos onde a ajuda permanente reduz erros.

Regras de estilo:
- Colocar abaixo do label (ou dentro do group) em fonte menor e cor neutra.
- Ser específico ao contexto (o que é validado, o que acontece a seguir).
- Evitar redundância com o Tooltip (ou use apenas um dos dois).

## Padrões Técnicos
- Componente Tooltip: `components/ui/tooltip.tsx`.
- Menu compacto para ações densas no mobile: `components/ui/button-menu.tsx`.
- Onde possível, envolver botões/ícones com `<Tooltip content="...">`.
- Para inputs, adicionar HelpCircle ao lado do label com Tooltip de exemplo.

## Exemplos rápidos
- Botão: `<Tooltip content="Sincronizar Cubbo"><Button>…</Button></Tooltip>`
- Título card: `Total Disponível <Tooltip content="físico + virtual − reservado"><HelpCircle /></Tooltip>`
- Input: `Label + <Tooltip content="Ex.: Campanha X…"><HelpCircle/></Tooltip>`

## Checklist de revisão
- [ ] Os tooltips explicam “o que” e não “por quê”.
- [ ] Textos são breves e legíveis.
- [ ] Elementos desabilitados não recebem Tooltip diretamente.
- [ ] Aria‑labels adicionados onde necessário.
- [ ] Padrão aplicado nas telas Admin e Gestor.
