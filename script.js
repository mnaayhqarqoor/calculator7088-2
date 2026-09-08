class Calculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.expression = '';
        this.history = [];
        this.memory = 0;
        this.isDegree = true;
        this.shouldResetDisplay = false;
        
        this.mainDisplay = document.getElementById('mainDisplay');
        this.expressionDisplay = document.getElementById('expressionDisplay');
        this.historyDisplay = document.getElementById('historyDisplay');
        this.scientificButtons = document.getElementById('scientificButtons');
        this.basicButtons = document.getElementById('basicButtons');
        
        this.init();
    }

    init() {
        // Button event listeners
        document.querySelectorAll('.btn-number').forEach(btn => {
            btn.addEventListener('click', () => this.appendNumber(btn.dataset.value));
        });

        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.addEventListener('click', () => this.chooseOperation(btn.dataset.value));
        });

        document.querySelectorAll('.btn-function').forEach(btn => {
            btn.addEventListener('click', () => this.handleFunction(btn.dataset.action));
        });

        document.querySelector('[data-action="calculate"]').addEventListener('click', () => this.calculate());

        // Scientific buttons
        document.querySelectorAll('.btn-scientific').forEach(btn => {
            btn.addEventListener('click', () => this.handleScientific(btn.dataset.action));
        });

        // Memory buttons
        document.querySelectorAll('.memory-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleMemory(btn.dataset.action));
        });

        // Mode toggle
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleMode(btn.dataset.mode));
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        this.updateDisplay();
    }

    appendNumber(number) {
        if (this.shouldResetDisplay) {
            this.currentOperand = '';
            this.shouldResetDisplay = false;
        }

        if (number === '.' && this.currentOperand.includes('.')) return;
        if (number === '00' && this.currentOperand === '0') return;
        
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }

        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;

        if (this.previousOperand !== '') {
            this.calculate();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.expression = `${this.formatNumber(this.previousOperand)} ${this.getOperatorSymbol(operation)}`;
        this.currentOperand = '0';
        this.updateDisplay();
    }

    handleFunction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'percent':
                this.percent();
                break;
        }
    }

    handleScientific(action) {
        const value = parseFloat(this.currentOperand);
        let result;

        switch (action) {
            case 'sin':
                result = this.isDegree ? Math.sin(value * Math.PI / 180) : Math.sin(value);
                break;
            case 'cos':
                result = this.isDegree ? Math.cos(value * Math.PI / 180) : Math.cos(value);
                break;
            case 'tan':
                result = this.isDegree ? Math.tan(value * Math.PI / 180) : Math.tan(value);
                break;
            case 'log':
                result = Math.log10(value);
                break;
            case 'ln':
                result = Math.log(value);
                break;
            case 'sqrt':
                result = Math.sqrt(value);
                break;
            case 'power':
                this.chooseOperation('^');
                return;
            case 'factorial':
                result = this.factorial(value);
                break;
            case 'pi':
                result = Math.PI;
                break;
            case 'e':
                result = Math.E;
                break;
            case 'rad':
                this.isDegree = false;
                this.updateDisplay();
                return;
            case 'deg':
                this.isDegree = true;
                this.updateDisplay();
                return;
        }

        if (result !== undefined) {
            this.addToHistory(`${action}(${value})`, result);
            this.currentOperand = result.toString();
            this.shouldResetDisplay = true;
            this.updateDisplay();
        }
    }

    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    calculate() {
        if (this.operation === undefined || this.previousOperand === '') return;

        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                computation = prev / current;
                break;
            case '^':
                computation = Math.pow(prev, current);
                break;
            default:
                return;
        }

        const expression = `${this.formatNumber(this.previousOperand)} ${this.getOperatorSymbol(this.operation)} ${this.formatNumber(this.currentOperand)}`;
        this.addToHistory(expression, computation);

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.expression = '';
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.expression = '';
        this.updateDisplay();
    }

    backspace() {
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        this.updateDisplay();
    }

    percent() {
        this.currentOperand = (parseFloat(this.currentOperand) / 100).toString();
        this.updateDisplay();
    }

    handleMemory(action) {
        const value = parseFloat(this.currentOperand);

        switch (action) {
            case 'mc':
                this.memory = 0;
                break;
            case 'mr':
                this.currentOperand = this.memory.toString();
                this.shouldResetDisplay = true;
                break;
            case 'm+':
                this.memory += value;
                break;
            case 'm-':
                this.memory -= value;
                break;
        }

        this.updateDisplay();
    }

    toggleMode(mode) {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

        if (mode === 'scientific') {
            this.scientificButtons.classList.remove('hidden');
        } else {
            this.scientificButtons.classList.add('hidden');
        }
    }

    handleKeyboard(e) {
        e.preventDefault();

        if (e.key >= '0' && e.key <= '9') {
            this.appendNumber(e.key);
        } else if (e.key === '.') {
            this.appendNumber('.');
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            this.chooseOperation(e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            this.calculate();
        } else if (e.key === 'Backspace') {
            this.backspace();
        } else if (e.key === 'Escape') {
            this.clear();
        } else if (e.key === '%') {
            this.percent();
        }
    }

    addToHistory(expression, result) {
        this.history.unshift({ expression, result });
        if (this.history.length > 5) {
            this.history.pop();
        }
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        if (this.history.length > 0) {
            const lastCalculation = this.history[0];
            this.historyDisplay.textContent = `${lastCalculation.expression} = ${this.formatNumber(lastCalculation.result.toString())}`;
        } else {
            this.historyDisplay.textContent = '';
        }
    }

    getOperatorSymbol(op) {
        switch (op) {
            case '*': return '×';
            case '/': return '÷';
            case '-': return '−';
            case '+': return '+';
            case '^': return '^';
            default: return op;
        }
    }

    formatNumber(number) {
        const num = parseFloat(number);
        if (isNaN(num)) return '0';
        
        // Handle very large or very small numbers
        if (Math.abs(num) > 1e12 || (Math.abs(num) < 1e-8 && num !== 0)) {
            return num.toExponential(6);
        }
        
        // Format with commas for thousands
        const parts = number.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    updateDisplay() {
        this.mainDisplay.textContent = this.formatNumber(this.currentOperand);
        
        if (this.expression) {
            this.expressionDisplay.textContent = this.expression;
        } else {
            this.expressionDisplay.textContent = '';
        }

        // Update mode indicator
        const modeIndicator = document.querySelector('.mode-btn.active');
        if (modeIndicator && this.scientificButtons.classList.contains('hidden')) {
            modeIndicator.textContent = 'أساسي';
        } else if (modeIndicator) {
            modeIndicator.textContent = 'علمي';
        }

        // Add angle mode indicator
        const angleMode = this.isDegree ? 'Deg' : 'Rad';
        if (!document.querySelector('.angle-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'angle-indicator';
            indicator.style.cssText = 'position: absolute; top: 10px; left: 10px; color: rgba(255,255,255,0.5); font-size: 12px;';
            indicator.textContent = angleMode;
            document.querySelector('.display-section').appendChild(indicator);
        } else {
            document.querySelector('.angle-indicator').textContent = angleMode;
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});
