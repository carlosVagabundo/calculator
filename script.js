(() => {
  "use strict";

  const HISTORY_KEY = "calculator.history.v3";
  const MAX_HISTORY_ITEMS = 50;

  const state = {
    current: "0",
    tokens: [],
    resetCurrent: false,
    justCalculated: false,
    lastExpression: "",
    memory: 0,
    history: [],
    signForNextNumber: false
  };

  const $ = (selector) => document.querySelector(selector);
  const refs = {
    current: $("#current-display"),
    previous: $("#previous-display"),
    keypad: $(".keypad"),
    history: $("#history-list"),
    clearHistory: $("#clear-history"),
    memoryIndicator: $("#memory-indicator")
  };

  const labels = { "+": "+", "-": "−", "*": "×", "/": "÷", "^": "^" };
  const operators = new Set(Object.keys(labels));
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };

  function isOperator(token) {
    return operators.has(token);
  }

  function normalizeNumber(value) {
    if (!Number.isFinite(value)) return "Erro";
    const n = Number(value.toPrecision(12));
    return Object.is(n, -0) ? "0" : String(n);
  }

  function formatNumber(value) {
    return value === "Erro" ? value : String(value).replace(".", ",");
  }

  function formatTokens(tokens) {
    return tokens.map((token) => {
      if (isOperator(token)) return labels[token];
      return token;
    }).join(" ");
  }

  function saveHistory() {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history)); }
    catch { /* armazenamento pode estar bloqueado */ }
  }

  function loadHistory() {
    try {
      const data = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      if (!Array.isArray(data)) return;
      state.history = data.filter(
        (item) => item && typeof item.expression === "string" && typeof item.result === "string"
      ).slice(0, MAX_HISTORY_ITEMS);
    } catch {
      state.history = [];
    }
  }

  function renderHistory() {
    refs.history.replaceChildren();

    if (!state.history.length) {
      const empty = document.createElement("div");
      empty.className = "history-empty";
      empty.textContent = "Nenhum cálculo realizado ainda.";
      refs.history.appendChild(empty);
      return;
    }

    state.history.forEach((item, index) => {
      const button = document.createElement("button");
      button.className = "history-item";
      button.type = "button";
      button.dataset.historyIndex = String(index);

      const expression = document.createElement("span");
      expression.className = "history-item__expression";
      expression.textContent = item.expression;

      const result = document.createElement("strong");
      result.className = "history-item__result";
      result.textContent = formatNumber(item.result);

      button.append(expression, result);
      refs.history.appendChild(button);
    });
  }

  function addHistory(expression, result) {
    state.history.unshift({ expression, result });
    state.history = state.history.slice(0, MAX_HISTORY_ITEMS);
    saveHistory();
    renderHistory();
  }

  function clearHistory() {
    state.history = [];
    saveHistory();
    renderHistory();
  }

  function updateMemoryIndicator() {
    refs.memoryIndicator.hidden = state.memory === 0;
  }

  function render() {
    const expression = state.justCalculated
      ? (state.lastExpression ? state.lastExpression + " =" : "")
      : formatTokens([
          ...state.tokens,
          ...(
            !state.resetCurrent && state.current !== "0"
              ? [state.current]
              : []
          )
        ]);

    refs.previous.textContent = expression || "0";
    refs.current.textContent = formatNumber(state.signForNextNumber ? "-0" : state.current);
    updateMemoryIndicator();
  }

  function resetAll() {
    state.current = "0";
    state.tokens = [];
    state.resetCurrent = false;
    state.justCalculated = false;
    state.lastExpression = "";
    state.signForNextNumber = false;
    render();
  }

  function inputNumber(digit) {
    if (state.current === "Erro") resetAll();

    if (state.justCalculated) {
      state.current = "0";
      state.tokens = [];
      state.justCalculated = false;
      state.lastExpression = "";
    }

    if (state.resetCurrent) {
      if (state.tokens.at(-1) === ")") state.tokens.push("*");
      state.current = state.signForNextNumber ? "-0" : "0";
      state.resetCurrent = false;
    }

    if (digit === ".") {
      if (state.current.includes(".")) return;
      if (state.current === "0") state.current = "0.";
      else if (state.current === "-0") state.current = "-0.";
      else state.current += ".";
    } else if (state.current === "0") {
      state.current = digit;
    } else if (state.current === "-0") {
      state.current = "-" + digit;
    } else {
      state.current += digit;
    }

    state.signForNextNumber = false;
    render();
  }

  function toggleSign() {
    if (state.current === "Erro") return;

    const pending = isOperator(state.tokens.at(-1)) || state.tokens.at(-1) === "(";
    if (state.resetCurrent && pending) {
      state.signForNextNumber = !state.signForNextNumber;
      render();
      return;
    }

    const value = Number(state.current);
    if (!Number.isFinite(value)) return;

    if (value === 0) {
      state.signForNextNumber = !state.signForNextNumber;
    } else {
      state.current = normalizeNumber(-value);
      state.resetCurrent = false;
      state.justCalculated = false;
    }
    render();
  }

  function applyPercent() {
    if (state.current === "Erro") return;
    const result = Number(state.current) / 100;
    if (!Number.isFinite(result)) {
      state.current = "Erro";
      render();
      return;
    }
    state.current = normalizeNumber(result);
    state.resetCurrent = false;
    state.justCalculated = false;
    render();
  }

  function chooseOperation(operation) {
    if (state.current === "Erro") return;

    if (operation === "%") {
      applyPercent();
      return;
    }

    if (state.justCalculated) {
      state.tokens = [state.current, operation];
      state.justCalculated = false;
      state.lastExpression = "";
      state.resetCurrent = true;
      state.signForNextNumber = false;
      render();
      return;
    }

    const last = state.tokens.at(-1);

    if (!state.tokens.length) {
      state.tokens.push(state.current, operation);
    } else if (last === "(") {
      if (operation === "-") state.signForNextNumber = !state.signForNextNumber;
      render();
      return;
    } else if (isOperator(last)) {
      state.tokens[state.tokens.length - 1] = operation;
    } else if (last === ")") {
      state.tokens.push(operation);
    } else {
      state.tokens.push(state.current, operation);
    }

    state.resetCurrent = true;
    state.signForNextNumber = false;
    render();
  }

  function openParenthesis() {
    if (state.current === "Erro") resetAll();
    if (state.justCalculated) resetAll();

    const last = state.tokens.at(-1);

    if (!state.tokens.length && state.current === "0" && !state.resetCurrent) {
      state.tokens.push("(");
    } else if (last === ")" || (!state.resetCurrent && state.tokens.length === 0 && state.current !== "0")) {
      state.tokens.push("*", "(");
    } else if (isOperator(last) || last === "(") {
      state.tokens.push("(");
    } else if (!state.resetCurrent) {
      state.tokens.push(state.current, "*", "(");
    } else {
      return;
    }

    state.current = "0";
    state.resetCurrent = true;
    state.signForNextNumber = false;
    render();
  }

  function closeParenthesis() {
    if (state.current === "Erro") return;

    let balance = 0;
    for (const token of state.tokens) {
      if (token === "(") balance++;
      if (token === ")") balance--;
    }
    if (balance <= 0) return;

    const last = state.tokens.at(-1);

    if (!state.resetCurrent) {
      if (last === "(" || isOperator(last) || last === ")") {
        if (last !== ")") return;
      } else {
        state.tokens.push(state.current);
      }
    } else if (last !== ")") {
      return;
    }

    state.tokens.push(")");
    state.current = "0";
    state.resetCurrent = true;
    state.signForNextNumber = false;
    state.justCalculated = false;
    render();
  }

  function toRpn(tokens) {
    const output = [];
    const stack = [];
    let expectsValue = true;

    for (const token of tokens) {
      if (token === "(") {
        stack.push(token);
        expectsValue = true;
        continue;
      }

      if (token === ")") {
        if (expectsValue) throw new Error("Parênteses inválidos");
        while (stack.length && stack.at(-1) !== "(") output.push(stack.pop());
        if (stack.pop() !== "(") throw new Error("Parênteses inválidos");
        expectsValue = false;
        continue;
      }

      if (isOperator(token)) {
        if (expectsValue) throw new Error("Operador inesperado");

        while (stack.length && isOperator(stack.at(-1))) {
          const top = stack.at(-1);
          const rightAssociative = token === "^";
          const shouldPop = rightAssociative
            ? precedence[token] < precedence[top]
            : precedence[token] <= precedence[top];

          if (!shouldPop) break;
          output.push(stack.pop());
        }

        stack.push(token);
        expectsValue = true;
        continue;
      }

      const value = Number(token);
      if (!expectsValue || !Number.isFinite(value)) {
        throw new Error("Número inválido");
      }
      output.push(value);
      expectsValue = false;
    }

    if (!output.length || expectsValue) throw new Error("Expressão incompleta");

    while (stack.length) {
      const token = stack.pop();
      if (token === "(") throw new Error("Parênteses inválidos");
      output.push(token);
    }

    return output;
  }

  function evaluateExpression(tokens) {
    const stack = [];

    for (const token of toRpn(tokens)) {
      if (typeof token === "number") {
        stack.push(token);
        continue;
      }

      const right = stack.pop();
      const left = stack.pop();
      if (left === undefined || right === undefined) throw new Error("Expressão inválida");

      let result;
      switch (token) {
        case "+": result = left + right; break;
        case "-": result = left - right; break;
        case "*": result = left * right; break;
        case "/":
          if (right === 0) throw new Error("Divisão por zero");
          result = left / right;
          break;
        case "^": result = left ** right; break;
        default: throw new Error("Operador inválido");
      }

      if (!Number.isFinite(result)) throw new Error("Resultado inválido");
      stack.push(result);
    }

    if (stack.length !== 1) throw new Error("Expressão inválida");
    return stack[0];
  }

  function calculate() {
    if (state.current === "Erro") return;

    const tokens = [...state.tokens];
    const last = tokens.at(-1);

    if (!state.resetCurrent) {
      if (last === ")") {
        // O grupo já está completo.
      } else if (last === "(" || isOperator(last)) {
        return;
      } else {
        tokens.push(state.current);
      }
    } else if (last !== ")") {
      return;
    }

    // Toda expressão precisa ter parênteses balanceados antes de ser calculada.
    let balance = 0;
    for (const token of tokens) {
      if (token === "(") balance++;
      if (token === ")") balance--;
      if (balance < 0) throw new Error("Parênteses inválidos");
    }
    if (balance !== 0) {
      state.current = "Erro";
      state.tokens = [];
      state.resetCurrent = true;
      state.justCalculated = true;
      state.lastExpression = "Parênteses inválidos";
      render();
      return;
    }

    try {
      const result = normalizeNumber(evaluateExpression(tokens));
      if (result === "Erro") throw new Error("Resultado inválido");

      const expression = formatTokens(tokens);
      addHistory(expression, result);

      state.current = result;
      state.tokens = [];
      state.resetCurrent = true;
      state.justCalculated = true;
      state.lastExpression = expression;
      state.signForNextNumber = false;
    } catch {
      state.current = "Erro";
      state.tokens = [];
      state.resetCurrent = true;
      state.justCalculated = true;
      state.lastExpression = "Operação inválida";
      state.signForNextNumber = false;
    }

    render();
  }

  function backspace() {
    if (state.current === "Erro" || state.justCalculated) {
      resetAll();
      return;
    }

    if (state.resetCurrent) {
      if (state.signForNextNumber) {
        state.signForNextNumber = false;
        render();
        return;
      }

      const last = state.tokens.at(-1);
      if (isOperator(last) || last === "(") state.tokens.pop();
      else if (last === ")") state.tokens.pop();

      state.current = "0";
      render();
      return;
    }

    if (state.current.length <= 1 || (state.current.length === 2 && state.current.startsWith("-"))) {
      state.current = "0";
    } else {
      state.current = state.current.slice(0, -1);
    }
    render();
  }

  function memorySet(value) {
    const normalized = normalizeNumber(value);
    if (normalized === "Erro") return;
    state.memory = Number(normalized);
    updateMemoryIndicator();
  }

  function memoryAdd() {
    const value = Number(state.current);
    if (Number.isFinite(value)) memorySet(state.memory + value);
  }

  function memorySubtract() {
    const value = Number(state.current);
    if (Number.isFinite(value)) memorySet(state.memory - value);
  }

  function memoryRecall() {
    if (state.current === "Erro") resetAll();
    state.current = normalizeNumber(state.memory);
    state.resetCurrent = false;
    state.justCalculated = false;
    state.lastExpression = "";
    state.signForNextNumber = false;
    render();
  }

  function memoryClear() {
    state.memory = 0;
    updateMemoryIndicator();
  }

  function action(type) {
    switch (type) {
      case "clear": resetAll(); break;
      case "backspace": backspace(); break;
      case "toggle-sign": toggleSign(); break;
      case "equals": calculate(); break;
      case "open-paren": openParenthesis(); break;
      case "close-paren": closeParenthesis(); break;
      case "memory-clear": memoryClear(); break;
      case "memory-recall": memoryRecall(); break;
      case "memory-add": memoryAdd(); break;
      case "memory-subtract": memorySubtract(); break;
      default: break;
    }
  }

  refs.keypad.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const { number, operation } = button.dataset;
    if (number !== undefined) inputNumber(number);
    else if (operation !== undefined) chooseOperation(operation);
    else if (button.dataset.action) action(button.dataset.action);
  });

  refs.history.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-history-index]");
    if (!button) return;

    const item = state.history[Number(button.dataset.historyIndex)];
    if (!item) return;

    state.current = item.result;
    state.tokens = [];
    state.resetCurrent = true;
    state.justCalculated = false;
    state.lastExpression = "";
    state.signForNextNumber = false;
    render();
  });

  refs.clearHistory.addEventListener("click", clearHistory);

  const keyboard = {
    Enter: calculate, "=": calculate,
    Backspace: backspace, Escape: resetAll, Delete: resetAll,
    c: resetAll,
    "(": openParenthesis, ")": closeParenthesis,
    "+": () => chooseOperation("+"),
    "-": () => chooseOperation("-"),
    "*": () => chooseOperation("*"),
    "/": () => chooseOperation("/"),
    "^": () => chooseOperation("^"),
    "%": applyPercent,
    m: memoryAdd, r: memoryRecall, d: memoryClear
  };

  document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (/^\d$/.test(key)) {
      event.preventDefault();
      inputNumber(key);
      return;
    }

    if (key === "." || key === ",") {
      event.preventDefault();
      inputNumber(".");
      return;
    }

    const handler = keyboard[key] || keyboard[key.toLowerCase()];
    if (handler) {
      event.preventDefault();
      handler();
    }
  });

  loadHistory();
  renderHistory();
  render();

  if (typeof window !== "undefined") {
    window.__calculatorTest = { evaluateExpression, toRpn };
  }
})();
