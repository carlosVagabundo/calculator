# Calculator

Calculadora científica web com cálculo por **expressão**, respeitando a ordem de precedência matemática.

## Níveis 2 e 3 implementados

### Nível 2 — Científica

- Parênteses
- Potência
- Raiz quadrada
- x²
- 1/x
- Fatorial
- Porcentagem
- sen, cos e tan
- log e ln
- π e e
- Graus e radianos
- Operações encadeadas
- Motor matemático sem `eval()`

### Nível 3 — Sistema e UX

- Histórico persistente
- Excluir cálculo individual
- Limpar histórico
- Favoritos persistentes
- Copiar resultado
- Configurações
- Tema claro/escuro
- Estilos Glass, Clássico e Compacto
- Texto maior
- Feedback sonoro opcional
- Layout responsivo
- Melhor acessibilidade e foco de teclado

## Ordem das expressões

A calculadora interpreta uma expressão inteira nesta ordem:

1. Parênteses
2. Funções
3. Potência
4. Multiplicação e divisão
5. Soma e subtração

Exemplos:

- `2 + 3 × 4 = 14`
- `(2 + 3) × 4 = 20`
- `2 + 3² × 4 = 38`
- `2³² = 512`
- `-2² = -4`

O motor usa **Shunting-yard + RPN** e suporta sinais unários, potência associativa à direita, funções científicas, constantes e operadores pós-fixos.

## Estrutura

```text
calculator/
├── index.html
├── style.css
├── script.js
├── engine.js
├── storage.js
├── README.md
├── tests/
│   ├── level2.test.js
│   └── level3.test.js
└── .github/
    └── workflows/
        └── pages.yml
```

## Execução

Abra `index.html` diretamente ou use o Live Server no VS Code. Não há dependências externas.

## Versão

v4.0 — Níveis 2 e 3 implementados.
