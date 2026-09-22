(() => {
  "use strict";

  const HISTORY_KEY = "calculator.history.v2";
  const MAX_HISTORY_ITEMS = 50;

  const state = {
    current: "0",
    expression: [],
    resetCurrent: false,
    justCalculated: false,
    lastExpression: "",
    memory: 0,
    history: [],
    signForNextNumber: false,
  };

  const currentDisplay = document.querySelector("#current-display");
  const previousDisplay = document.querySelector("#previous-display");
  const keypad = document.querySelector(".keypad");
  const historyList = document.querySelector("#history-list");
  const clearHistoryButton = document.querySelector("#clear-history");
  const memoryIndicator = document.querySelector("#memory-indicator");

  const operationLabels = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
  };

  const operators = new Set(["+", "-", "*", "/"]);

  function isOperator(token) {
    return operators.has(token);
  }

  function normalizeNumber(value) {
    if (!Number.isFinite(value)) {
      return "Erro";
    }

    const normalized = Number(value.toPrecision(12));
    return Object.is(normalized, -0) ? "0" : String(normalized);
  }

  function formatNumber(value) {
    if (value === "Erro") return value;
    return String(value).replace(".", ",");
  }

  function formatExpression(tokens) {
    return tokens.map((token) => isOperator(token)
      ? operationLabels[token]
      : formatNumber(token)
    ).join(" ");
  }

  function hasPendingOperation() {
    return state.expression.length > 0 && isOperator(state.expression[state.expression.length - 1]);
  }

  function updateMemoryIndicator() {
    memoryIndicator.hidden = state.memory === 0;
  }

  function updateDisplay() {
    const visibleCurrent = state.signForNextNumber
      ? "-0"
      : hasPendingOperation() && state.resetCurrent
        ? "0"
        : state.current;

    currentDisplay.textContent = formatNumber(visibleCurrent);

    if (state.lastExpression && state.justCalculated) {
      previousDisplay.textContent = `${state.lastExpression} =`;
    } else if (state.expression.length > 0) {
      previousDisplay.textContent = formatExpression(state.expression);
    } else {
      previousDisplay.textContent = "0";
    }

    updateMemoryIndicator();
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
    } catch {
      // O histórico continua funcionando mesmo quando o armazenamento não está disponível.
    }
  }

  function loadHistory() {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      if (!Array.isArray(saved)) return;

      state.history = saved
        .filter((item) => item && typeof item.expression === "string" && typeof item.result === "string")
        .slice(0, MAX_HISTORY_ITEMS);
    } catch {
      state.history = [];
    }
  }

  function renderHistory() {
    historyList.replaceChildren();

    if (state.history.length === 0) {
      const empty = document.createElement("div");
      empty.className = "history-empty";
      empty.textContent = "Nenhum cálculo realizado ainda.";
      historyList.appendChild(empty);
      return;
    }

    state.history.forEach((item, index) => {
      const button = document.createElement("button");
      button.className = "history-item";
      button.type = "button";
      button.dataset.historyIndex = String(index);
      button.setAttribute("aria-label", `Usar resultado ${formatNumber(item.result)}`);

      const expression = document.createElement("span");
      expression.className = "history-item__expression";
      expression.textContent = item.expression;

      const result = document.createElement("strong");
      result.className = "history-item__result";
      result.textContent = formatNumber(item.result);

      button.append(expression, result);
      historyList.appendChild(button);
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

  function clear() {
    state.current = "0";
    state.expression = [];
    state.resetCurrent = false;
    state.justCalculated = false;
    state.lastExpression = "";
    state.signForNextNumber = false;
    updateDisplay();
  }

  function inputNumber(number) {
    if (state.current === "Erro") {
      clear();
    }

    if (state.justCalculated) {
      state.current = "0";
      state.expression = [];
      state.justCalculated = false;
      state.lastExpression = "";
    }

    if (state.resetCurrent) {
      state.current = state.signForNextNumber ? "-0" : "0";
      state.resetCurrent = false;
    }

    if (number === ".") {
      if (state.current.includes(".")) return;
      state.current = state.current === "0"
        ? "0."
        : state.current === "-0"
          ? "-0."
          : `${state.current}.`;
    } else if (state.current === "0") {
      state.current = number;
    } else if (state.current === "-0") {
      state.current = `-${number}`;
    } else {
      state.current += number;
    }

    state.signForNextNumber = false;
    updateDisplay();
  }

  function toggleSign() {
    if (state.current === "Erro") return;

    if (hasPendingOperation() && state.resetCurrent) {
      state.signForNextNumber = !state.signForNextNumber;
      state.justCalculated = false;
      updateDisplay();
      return;
    }

    const value = Number(state.current);
    if (value === 0) return;

    state.current = normalizeNumber(-value);
    state.resetCurrent = false;
    state.justCalculated = false;
    state.signForNextNumber = false;
    updateDisplay();
  }

  function applyPercent() {
    if (state.current === "Erro") return;

    const value = Number(state.current) / 100;
    state.current = normalizeNumber(value);
    state.resetCurrent = false;
    state.justCalculated = false;
    updateDisplay();
  }

  function chooseOperation(operation) {
    if (state.current === "Erro") return;

    if (operation === "%") {
      applyPercent();
      return;
    }

    if (state.justCalculated) {
      state.expression = [state.current, operation];
      state.justCalculated = false;
      state.lastExpression = "";
      state.signForNextNumber = false;
    } else if (state.expression.length === 0) {
      state.expression.push(state.current, operation);
    } else if (hasPendingOperation()) {
      if (state.resetCurrent) {
        // Troca um operador que acabou de ser pressionado: 5 + → 5 ×
        state.expression[state.expression.length - 1] = operation;
      } else {
        // O valor atual já foi digitado e precisa entrar na expressão.
        state.expression.push(state.current, operation);
      }
    } else {
      state.expression.push(state.current, operation);
    }

    state.resetCurrent = true;
    updateDisplay();
  }

  function evaluateExpression(tokens) {
    if (tokens.length === 0) return 0;

    const values = tokens.filter((_, index) => index % 2 === 0);
    const operations = tokens.filter((_, index) => index % 2 === 1);

    if (
      values.length !== operations.length + 1 ||
      values.some((value) => !Number.isFinite(Number(value)))
    ) {
      throw new Error("Expressão inválida");
    }

    let total = 0;
    let term = Number(values[0]);

    for (let index = 0; index < operations.length; index += 1) {
      const operation = operations[index];
      const value = Number(values[index + 1]);

      if (operation === "*") {
        term *= value;
      } else if (operation === "/") {
        if (value === 0) {
          throw new Error("Divisão por zero");
        }
        term /= value;
      } else if (operation === "+") {
        total += term;
        term = value;
      } else if (operation === "-") {
        total += term;
        term = -value;
      } else {
        throw new Error("Operador inválido");
      }

      if (!Number.isFinite(term) || !Number.isFinite(total)) {
        throw new Error("Resultado inválido");
      }
    }

    return total + term;
  }

  function calculate() {
    if (state.current === "Erro" || state.expression.length === 0) {
      return;
    }

    const tokens = [...state.expression];
    tokens.push(state.current);

    try {
      const result = normalizeNumber(evaluateExpression(tokens));
      if (result === "Erro") throw new Error("Resultado inválido");

      const expression = formatExpression(tokens);
      addHistory(expression, result);

      state.current = result;
      state.expression = [];
      state.resetCurrent = true;
      state.signForNextNumber = false;
      state.justCalculated = true;
      state.lastExpression = expression;
    } catch {
      state.current = "Erro";
      state.expression = [];
      state.resetCurrent = true;
      state.justCalculated = true;
      state.signForNextNumber = false;
      state.lastExpression = "Operação inválida";
    }

    updateDisplay();
  }

  function backspace() {
    if (state.current === "Erro") {
      clear();
      return;
    }

    if (state.justCalculated) {
      clear();
      return;
    }

    if (state.resetCurrent && hasPendingOperation()) {
      if (state.signForNextNumber) {
        state.signForNextNumber = false;
        updateDisplay();
        return;
      }

      state.expression.pop();
      state.current = state.expression.pop() || "0";
      state.resetCurrent = false;
      updateDisplay();
      return;
    }

    if (state.current.length <= 1 || (state.current.length === 2 && state.current.startsWith("-"))) {
      state.current = "0";
    } else {
      state.current = state.current.slice(0, -1);
    }

    updateDisplay();
  }

  function updateMemory(value) {
    const normalized = normalizeNumber(value);
    if (normalized === "Erro") return false;
    state.memory = Number(normalized);
    updateMemoryIndicator();
    return true;
  }

  function memoryAdd() {
    const value = Number(state.current);
    if (!Number.isFinite(value)) return;
    updateMemory(state.memory + value);
  }

  function memorySubtract() {
    const value = Number(state.current);
    if (!Number.isFinite(value)) return;
    updateMemory(state.memory - value);
  }

  function memoryRecall() {
    if (state.current === "Erro") clear();
    state.current = normalizeNumber(state.memory);
    state.resetCurrent = false;
    state.justCalculated = false;
    state.lastExpression = "";
    state.signForNextNumber = false;
    updateDisplay();
  }

  function memoryClear() {
    state.memory = 0;
    updateMemoryIndicator();
  }

  function handleAction(action) {
    switch (action) {
      case "clear":
        clear();
        break;
      case "backspace":
        backspace();
        break;
      case "toggle-sign":
        toggleSign();
        break;
      case "equals":
        calculate();
        break;
      case "memory-clear":
        memoryClear();
        break;
      case "memory-recall":
        memoryRecall();
        break;
      case "memory-add":
        memoryAdd();
        break;
      case "memory-subtract":
        memorySubtract();
        break;
      default:
        break;
    }
  }

  keypad.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const { number, operation, action } = button.dataset;

    if (number !== undefined) {
      inputNumber(number);
    } else if (operation !== undefined) {
      chooseOperation(operation);
    } else if (action !== undefined) {
      handleAction(action);
    }
  });

  historyList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-history-index]");
    if (!button) return;

    const item = state.history[Number(button.dataset.historyIndex)];
    if (!item) return;

    state.current = item.result;
    state.expression = [];
    state.resetCurrent = true;
    state.justCalculated = false;
    state.lastExpression = "";
    state.signForNextNumber = false;
    updateDisplay();
  });

  clearHistoryButton.addEventListener("click", clearHistory);

  const keyboardActions = {
    Enter: () => calculate(),
    "=": () => calculate(),
    Backspace: () => backspace(),
    Escape: () => clear(),
    Delete: () => clear(),
    c: () => clear(),
    "+": () => chooseOperation("+"),
    "-": () => chooseOperation("-"),
    "*": () => chooseOperation("*"),
    "/": () => chooseOperation("/"),
    "%": () => applyPercent(),
    m: () => memoryAdd(),
    r: () => memoryRecall(),
    d: () => memoryClear(),
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

    const action = keyboardActions[key] || keyboardActions[key.toLowerCase()];
    if (action) {
      event.preventDefault();
      action();
    }
  });

  loadHistory();
  renderHistory();
  updateDisplay();
})();
