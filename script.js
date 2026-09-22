(() => {
  "use strict";

  const state = {
    current: "0",
    previous: "",
    operation: null,
    resetCurrent: false,
  };

  const currentDisplay = document.querySelector("#current-display");
  const previousDisplay = document.querySelector("#previous-display");
  const keypad = document.querySelector(".keypad");

  const operationLabels = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
  };

  function formatNumber(value) {
    if (value === "Erro") return value;
    return value.replace(".", ",");
  }

  function updateDisplay() {
    currentDisplay.textContent = formatNumber(state.current);

    if (state.operation && state.previous) {
      previousDisplay.textContent =
        formatNumber(state.previous) + " " + operationLabels[state.operation];
    } else {
      previousDisplay.textContent = state.previous
        ? formatNumber(state.previous)
        : "0";
    }
  }

  function clear() {
    state.current = "0";
    state.previous = "";
    state.operation = null;
    state.resetCurrent = false;
    updateDisplay();
  }

  function inputNumber(number) {
    if (state.current === "Erro") {
      clear();
    }

    if (state.resetCurrent) {
      state.current = "0";
      state.resetCurrent = false;
    }

    if (number === "." && state.current.includes(".")) {
      return;
    }

    if (state.current === "0" && number !== ".") {
      state.current = number;
    } else {
      state.current += number;
    }

    updateDisplay();
  }

  function chooseOperation(operation) {
    if (state.current === "Erro") return;

    if (operation === "%") {
      state.current = String(Number(state.current) / 100);
      state.resetCurrent = true;
      updateDisplay();
      return;
    }

    if (state.operation && !state.resetCurrent) {
      calculate();
    }

    state.previous = state.current;
    state.operation = operation;
    state.resetCurrent = true;
    updateDisplay();
  }

  function calculate() {
    if (!state.operation || state.previous === "") return;

    const left = Number(state.previous);
    const right = Number(state.current);
    let result;

    switch (state.operation) {
      case "+":
        result = left + right;
        break;
      case "-":
        result = left - right;
        break;
      case "*":
        result = left * right;
        break;
      case "/":
        if (right === 0) {
          state.current = "Erro";
          state.previous = "";
          state.operation = null;
          state.resetCurrent = true;
          updateDisplay();
          return;
        }
        result = left / right;
        break;
      default:
        return;
    }

    const rounded = Number(result.toPrecision(12));

    state.current = String(rounded);
    state.previous = "";
    state.operation = null;
    state.resetCurrent = true;
    updateDisplay();
  }

  function backspace() {
    if (state.current === "Erro" || state.resetCurrent) {
      clear();
      return;
    }

    state.current = state.current.length > 1
      ? state.current.slice(0, -1)
      : "0";

    updateDisplay();
  }

  function handleAction(action) {
    if (action === "clear") clear();
    if (action === "backspace") backspace();
    if (action === "equals") calculate();
  }

  keypad.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const number = button.dataset.number;
    const operation = button.dataset.operation;
    const action = button.dataset.action;

    if (number !== undefined) inputNumber(number);
    else if (operation !== undefined) chooseOperation(operation);
    else if (action !== undefined) handleAction(action);
  });

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

    if (["+", "-", "*", "/"].includes(key)) {
      event.preventDefault();
      chooseOperation(key);
      return;
    }

    if (key === "%") {
      event.preventDefault();
      chooseOperation("%");
      return;
    }

    if (key === "Enter" || key === "=") {
      event.preventDefault();
      calculate();
      return;
    }

    if (key === "Backspace") {
      event.preventDefault();
      backspace();
      return;
    }

    if (key === "Escape" || key.toLowerCase() === "c") {
      event.preventDefault();
      clear();
    }
  });

  updateDisplay();
})();
