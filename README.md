# Calculator

Calculadora web evolutiva com histórico, memória e um motor de cálculo baseado na ordem de precedência da matemática.

## Precedência usada

A expressão é analisada nesta ordem:

1. **Parênteses**
2. **Potências**
3. **Multiplicação e divisão**
4. **Soma e subtração**

Por exemplo:

`2 + 3 × 4 = 14`

e:

`(2 + 3) × 4 = 20`

A potência também respeita sua precedência:

`2 + 3^2 × 4 = 38`

## Funcionalidades

- Soma, subtração, multiplicação e divisão
- Cálculos encadeados
- Ordem matemática de operações
- Parênteses
- Potência `xʸ`
- Porcentagem simples
- `±`
- Backspace
- Memória: `MC`, `MR`, `M+`, `M−`
- Histórico persistente com `localStorage`
- Reutilização de resultados do histórico
- Suporte a teclado físico
- Proteção contra divisão por zero
- Tratamento de expressões inválidas
- Interface responsiva e renovada

## Teclado

| Tecla | Função |
| --- | --- |
| `0` a `9` | Número |
| `.` ou `,` | Decimal |
| `+ - * /` | Operações |
| `^` | Potência |
| `%` | Porcentagem |
| `(` e `)` | Parênteses |
| `Enter` / `=` | Calcular |
| `Backspace` | Apagar |
| `Esc`, `Delete` ou `C` | Limpar |
| `M` | M+ |
| `R` | MR |
| `D` | MC |

## Estrutura

```text
calculator/
├── index.html
├── style.css
├── script.js
├── README.md
└── .github/
    └── workflows/
        └── pages.yml
```

## Execução

Não há dependências externas. Abra `index.html` no navegador ou use o Live Server no VS Code.

## Versão

v3.0
