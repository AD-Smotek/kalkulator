const inputElem = document.querySelector('#calculator-input');
const outputElem = document.querySelector('#calculator-output');
const historyElem = document.querySelector('#history-display');
const clearHistoryBtn = document.querySelector('#clear-history-btn');
const btns = [...document.querySelectorAll('.calculator-buttons button')];

let inputStr = '0';
let lastAnswer = null;
let calcHistory = JSON.parse(localStorage.getItem('calcHist')) || [];

function updateInput() {
  inputElem.textContent = inputStr;
}

function updateOutput(value) {
  outputElem.textContent = value;
}

function updateHistory() {
  historyElem.innerHTML = '';
  calcHistory.forEach(entry => {
    const div = document.createElement('div');
    div.textContent = entry;
    historyElem.appendChild(div);
  });
  localStorage.setItem('calcHist', JSON.stringify(calcHistory));
}

function resetAll() {
  inputStr = '0';
  updateInput();
  updateOutput('0');
}

function backspace() {
  if (inputStr.length > 1) {
    inputStr = inputStr.slice(0, -1);
  } else {
    inputStr = '0';
  }
  updateInput();
}

function addToInput(ch) {
  if (inputStr === '0' && ch !== '.') {
    inputStr = ch;
  } else {
    inputStr += ch;
  }
  updateInput();
}

function sanitizeExpression(expr) {
  let result = '';
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '^') {
      result += '**';
    } else {
      result += expr[i];
    }
  }
  return result;
}

function computeExpression() {
  if (!inputStr.trim()) return;
  try {
    let sanitized = sanitizeExpression(inputStr);
    let val = eval(sanitized);

    if (typeof val === 'number' && isFinite(val)) {
      val = Math.round(val * 1e10) / 1e10;
      updateOutput(val);
      lastAnswer = val;
      calcHistory.push(`${inputStr} = ${val}`);
      updateHistory();
      inputStr = '0';
      updateInput();
    } else {
      updateOutput('Error');
    }
  } catch {
    updateOutput('Error');
  }
}

btns.forEach(btn => {
  btn.addEventListener('click', () => {
    let val = btn.value ?? null;

    if (!val) {
      if (btn.id === 'clear-btn') val = 'BACK';
      else if (btn.id === 'clear-all-btn') val = 'RESET';
    }

    switch(val) {
      case 'BACK':
        backspace();
        break;
      case 'RESET':
        resetAll();
        break;
      case '=':
        computeExpression();
        break;
      case '+':
      case '-':
      case '*':
      case '/':
      case '^':
      case '(':
      case ')':
        if ((inputStr === '0' || inputStr === '') && lastAnswer !== null) {
          inputStr = String(lastAnswer);
        }
        addToInput(val);
        break;
      default:
        if (/^[0-9.]$/.test(val)) {
          addToInput(val);
        }
        break;
    }
  });
});

window.addEventListener('keydown', e => {
  const keys = '0123456789+-*/^().';
  if (keys.includes(e.key)) {
    if ((inputStr === '0' || inputStr === '') && ['+', '-', '*', '/', '^'].includes(e.key) && lastAnswer !== null) {
      inputStr = String(lastAnswer);
    }
    addToInput(e.key);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    computeExpression();
  } else if (e.key === 'Backspace') {
    backspace();
  } else if (e.key === 'Delete') {
    resetAll();
  }
});

updateHistory();
updateInput();
updateOutput('0');
