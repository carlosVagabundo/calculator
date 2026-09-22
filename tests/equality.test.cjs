const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../engine");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");

function almostEqual(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} !== ${expected}`);
}

// 1. Botão "=" existe e está ligado à ação correta.
assert.match(html, /data-action="equals"[^>]*>\s*=\s*<\/button>/);

// 2. O controlador do teclado/botões encaminha a ação "equals" para calculate().
assert.match(script, /if\(type==="equals"\)return calculate\(\)/);
assert.match(script, /if\(k==="Enter"\|\|k==="="\)\{e\.preventDefault\(\);calculate\(\);return\}/);

// 3. Cálculos básicos acionados pelo mesmo motor usado pelo botão "=".
almostEqual(engine.evaluate("2+3"), 5);
almostEqual(engine.evaluate("10-4"), 6);
almostEqual(engine.evaluate("6*7"), 42);
almostEqual(engine.evaluate("20/5"), 4);

// 4. Expressões completas respeitando a ordem matemática.
almostEqual(engine.evaluate("2+3*4"), 14);
almostEqual(engine.evaluate("(2+3)*4"), 20);
almostEqual(engine.evaluate("2+3^2*4"), 38);

// 5. Casos científicos.
almostEqual(engine.evaluate("sqrt(81)"), 9);
almostEqual(engine.evaluate("sin(30)", { angleMode: "DEG" }), 0.5);

// 6. Erro importante: divisão por zero continua sendo rejeitada.
assert.throws(() => engine.evaluate("5/0"), /Divisão por zero/);

process.stdout.write("EQUALS REGRESSION: ALL TESTS PASSED\n");
