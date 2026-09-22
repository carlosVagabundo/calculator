# Calculator

Calculadora científica web com precedência matemática. O projeto agora inclui o Nível 4, com recursos avançados de cálculo, persistência, acessibilidade, exportação de dados e funcionamento offline em ambientes compatíveis.

## Nível 2 — Científica
- Parênteses, potência, raiz, x², 1/x, fatorial e porcentagem
- sen, cos e tan
- log e ln
- π e e
- Graus e radianos
- Expressões completas respeitando precedência matemática
- Motor sem eval()

## Nível 3 — Sistema e UX
- Histórico e favoritos persistentes
- Exclusão individual e limpeza do histórico
- Copiar resultado
- Configurações persistentes
- Tema claro/escuro
- Estilos Glass, Clássico e Compacto
- Texto maior, som opcional, responsividade e foco acessível
- Regressões automatizadas no GitHub Actions

## Nível 4 — Recursos avançados
- ANS para reutilizar o último resultado
- asin, acos, atan, abs, exp, floor e ceil
- Prévia do resultado enquanto a expressão está válida
- Busca em histórico e favoritos
- Data e hora dos registros
- Exportação e importação de backup JSON
- Migração compatível com os dados do Nível 3
- Saneamento dos dados persistidos
- Painel de sessão com indicadores
- Ajuda integrada com atalhos de teclado
- Controle de animações
- Modo Básico compacto, inspirado em calculadoras de celular
- Modo Científico completo com todas as funções avançadas
- Teclado científico completo com 1, 2 e 3
- Constantes π, e e ANS acionáveis pela interface
- Memória usando a expressão atual quando possível
- Manifest e service worker para cache/offline após a primeira visita em HTTPS

## Precedência
1. Parênteses
2. Funções
3. Potência
4. Multiplicação e divisão
5. Soma e subtração

Exemplos:
- 2 + 3 × 4 = 14
- (2 + 3) × 4 = 20
- 2 + 3² × 4 = 38
- 2³² = 512
- -2² = -4
- 2 + ANS usa o último resultado calculado

O motor usa Shunting-yard + RPN e não depende de eval().

## Estrutura
calculator/
├── index.html
├── style.css
├── script.js
├── engine.js
├── storage.js
├── manifest.webmanifest
├── sw.js
├── README.md
├── tests/
│   ├── level2.test.js
│   ├── level3.test.js
│   ├── level4.test.cjs
│   └── equality.test.cjs
└── .github/
    └── workflows/
        ├── pages.yml
        └── tests.yml

## Execução
Abra index.html ou use o Live Server no VS Code. Não há dependências externas. Em GitHub Pages/HTTPS, o service worker é registrado automaticamente.

## Testes
O workflow executa os testes dos Níveis 2, 3, 4 e a regressão específica do botão =.

## Versão
v4.2 — Nível 4 com modos Básico e Científico.