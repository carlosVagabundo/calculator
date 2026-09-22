# Calculator

Calculadora web desenvolvida como um projeto evolutivo. A base foi mantida simples e sem dependências externas para facilitar futuras expansões.

## Tecnologias

- HTML5
- CSS3
- JavaScript puro
- Web Storage (localStorage) para o histórico

## Funcionalidades da versão 2.0

- Soma, subtração, multiplicação e divisão
- Operações encadeadas com precedência matemática para `×` e `÷`
- Porcentagem simples
- Botão `±` para inverter o sinal
- Backspace para apagar um caractere
- Memória: `MC`, `MR`, `M+` e `M−`
- Histórico persistente no navegador
- Limpeza do histórico
- Clique em um item do histórico para reutilizar o resultado
- Suporte a teclado físico
- Atalhos de teclado para memória
- Proteção contra divisão por zero
- Tratamento de expressões inválidas e resultados não finitos
- Layout responsivo

## Teclado

| Tecla | Ação |
| --- | --- |
| `0` a `9` | Digitar número |
| `.` ou `,` | Decimal |
| `+ - * /` | Operações |
| `%` | Porcentagem |
| `Enter` ou `=` | Resultado |
| `Backspace` | Apagar |
| `Esc` ou `Delete` | Limpar |
| `C` | Limpar |
| `M` | M+ |
| `R` | MR |
| `D` | MC |

## Como executar

1. Clone o repositório.
2. Abra `index.html` no navegador.

Também é possível usar o Live Server no VS Code.

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

## Próximos passos sugeridos

- Parênteses
- Potência e raízes
- Funções científicas
- Modo graus/radianos
- Temas claro/escuro
- Mais ferramentas de conversão
- Testes automatizados no projeto

## Versão

v2.0 — Nível 1 implementado.
