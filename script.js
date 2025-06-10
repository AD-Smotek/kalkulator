const inputDisplay = document.getElementById('calculator-input');
const outputDisplay = document.getElementById('calculator-output');
const buttons = document.querySelectorAll('.calculator-buttons button');
const historyDisplay = document.getElementById('history-display');
const clearHistoryBtn = document.getElementById('clear-history-btn');

let currentInput = '';
let lastResult = null;
let history = JSON.parse(localStorage.getItem('calcHistory')) || [];


function renderHistory() {
  historyDisplay.innerHTML = history.map(item => `<div>${item}</div>`).join('');
}


function saveHistory() {
  localStorage.setItem('calcHistory', JSON.stringify(history));
  renderHistory();
}


clearHistoryBtn.addEventListener('click', () => {
  history = [];
  saveHistory();
});


function appendToInput(value) {
  if (currentInput === '0' && value !== '.') {
    currentInput = value;
  } else {
    currentInput += value;
  }
  inputDisplay.textContent = currentInput;
}


function clearLast() {
  currentInput = currentInput.slice(0, -1);
  if (currentInput === '') currentInput = '0';
  inputDisplay.textContent = currentInput;
}


function clearAll() {
  currentInput = '0';
  inputDisplay.textContent = currentInput;
  outputDisplay.textContent = '0';
}


function prepareExpression(expr) {
  return expr.replace(/\^/g, '**');
}


function calculate() {
  try {
    if (currentInput.trim() === '') return;
    const expr = prepareExpression(currentInput);
    let result = Function('"use strict";return (' + expr + ')')();
    if (typeof result === 'number' && !isNaN(result)) {
      outputDisplay.textContent = result;
      lastResult = result;
      // Zapsat do historie
      history.push(`${currentInput} = ${result}`);
      saveHistory();
      currentInput = '';
      inputDisplay.textContent = '';
    } else {
      outputDisplay.textContent = 'Error';
    }
  } catch (e) {
    outputDisplay.textContent = 'Error';
  }
}


buttons.forEach(button => {
  button.addEventListener('click', () => {
    const val = button.value;

    if (val === 'C') {
      clearLast();
    } else if (val === 'CE') {
      clearAll();
    } else if (val === '=') {
      calculate();
    } else if (['+', '-', '*', '/', '^'].includes(val)) {
      
      if (currentInput === '' && lastResult !== null) {
        currentInput = lastResult.toString();
      }
      appendToInput(val);
    } else if (val === '(' || val === ')') {
      appendToInput(val);
    } else {
      
      appendToInput(val);
    }
  });
});


document.addEventListener('keydown', e => {
  const allowedKeys = '0123456789+-*/^().';
  if (allowedKeys.includes(e.key)) {
    if (currentInput === '' && ['+', '-', '*', '/', '^'].includes(e.key) && lastResult !== null) {
      currentInput = lastResult.toString();
    }
    appendToInput(e.key);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    calculate();
  } else if (e.key === 'Backspace') {
    clearLast();
  } else if (e.key === 'Delete') {
    clearAll();
  }
});

renderHistory();
