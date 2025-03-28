// Juego matemático implementado directamente en JavaScript
// No requiere Python ni Pyodide para funcionar

class MathGame {
  constructor(canvasId, outputId, gameType = 'calculus') {
    // Elementos DOM
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.outputElement = document.getElementById(outputId);
    
    // Configuración del juego
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.gameType = gameType; // 'calculus' o 'graph'
    
    // Estado del juego
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.isGameOver = false;
    this.isPaused = false;
    this.currentProblem = null;
    this.timeRemaining = 30;
    this.problemsSolved = 0;
    
    // Historial de respuestas
    this.answers = [];
    
    // Elementos visuales
    this.colors = {
      background: '#1a237e', // Azul oscuro
      text: '#ffffff',
      correct: '#4CAF50', // Verde
      incorrect: '#f44336', // Rojo
      button: '#2196F3', // Azul
      buttonHover: '#0b7dda',
      timeBar: '#FF9800' // Naranja
    };
    
    // Opciones múltiples para respuestas
    this.options = [];
    this.selectedOption = -1;
    
    // Escuchadores de eventos
    this.setupEventListeners();
    
    // Añadir mensajes al output
    this.log('Juego matemático iniciado');
    this.log(`Tipo de juego: ${gameType === 'calculus' ? 'Cálculo Diferencial' : 'Gráficas Matemáticas'}`);
  }
  
  // Iniciar el juego
  start() {
    this.log('¡El juego ha comenzado!');
    this.generateProblem();
    this.update();
  }
  
  // Generar un nuevo problema matemático según el tipo de juego
  generateProblem() {
    if (this.gameType === 'calculus') {
      this.generateCalculusProblem();
    } else {
      this.generateGraphProblem();
    }
    this.timeRemaining = 30; // Reiniciar el tiempo
    this.options = this.generateOptions();
    this.selectedOption = -1;
  }
  
  // Generar problema de cálculo
  generateCalculusProblem() {
    // Tipos de problemas basados en el nivel
    const problemTypes = [
      // Nivel 1: Derivadas básicas
      () => {
        const a = Math.floor(Math.random() * 10) + 1;
        const n = Math.floor(Math.random() * 5) + 1;
        return {
          question: `Calcula: d/dx(${a}x^${n})`,
          expression: `${a}x^${n}`,
          answer: `${a*n}x^${n-1}`,
          difficulty: 1
        };
      },
      // Nivel 2: Regla del producto
      () => {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        return {
          question: `Calcula: d/dx(${a}x * ${b}x^2)`,
          expression: `${a}x * ${b}x^2`,
          answer: `${a*b}x^2 + ${2*a*b}x^3`,
          difficulty: 2
        };
      },
      // Nivel 3: Funciones trigonométricas
      () => {
        const funcs = ['sin', 'cos'];
        const func = funcs[Math.floor(Math.random() * funcs.length)];
        const result = func === 'sin' ? 'cos' : '-sin';
        return {
          question: `Calcula: d/dx(${func}(x))`,
          expression: `${func}(x)`,
          answer: func === 'sin' ? 'cos(x)' : '-sin(x)',
          difficulty: 3
        };
      }
    ];
    
    // Seleccionar tipo de problema basado en nivel
    const levelIndex = Math.min(this.level - 1, problemTypes.length - 1);
    const problemGenerator = problemTypes[levelIndex];
    this.currentProblem = problemGenerator();
    
    this.log(`Nuevo problema: ${this.currentProblem.question}`);
  }
  
  // Generar problema de gráficas
  generateGraphProblem() {
    // Funciones para graficar y sus derivadas
    const functions = [
      {
        name: 'f(x) = x^2',
        original: (x) => x * x,
        derivative: (x) => 2 * x,
        originalEq: 'x^2',
        derivativeEq: '2x'
      },
      {
        name: 'f(x) = x^3',
        original: (x) => x * x * x,
        derivative: (x) => 3 * x * x,
        originalEq: 'x^3',
        derivativeEq: '3x^2'
      },
      {
        name: 'f(x) = sin(x)',
        original: (x) => Math.sin(x),
        derivative: (x) => Math.cos(x),
        originalEq: 'sin(x)',
        derivativeEq: 'cos(x)'
      },
      {
        name: 'f(x) = cos(x)',
        original: (x) => Math.cos(x),
        derivative: (x) => -Math.sin(x),
        originalEq: 'cos(x)',
        derivativeEq: '-sin(x)'
      }
    ];
    
    // Seleccionar una función aleatoria
    const selectedFunction = functions[Math.floor(Math.random() * functions.length)];
    
    // Tipo de pregunta: identificar la derivada o la función original
    const questionTypes = [
      {
        type: 'identify-derivative',
        question: `¿Cuál es la derivada de ${selectedFunction.name}?`,
        answer: selectedFunction.derivativeEq,
        difficulty: 2
      },
      {
        type: 'identify-graph',
        question: `Identifica la gráfica que corresponde a la derivada de ${selectedFunction.name}`,
        answer: 'derivative',
        function: selectedFunction,
        difficulty: 3
      }
    ];
    
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    this.currentProblem = {
      ...questionType,
      selectedFunction
    };
    
    this.log(`Nuevo problema: ${this.currentProblem.question}`);
  }
  
  // Generar opciones múltiples para el problema actual
  generateOptions() {
    let correctAnswer = this.currentProblem.answer;
    let options = [correctAnswer];
    
    // Generar opciones incorrectas según el tipo de juego
    if (this.gameType === 'calculus') {
      // Para problemas de cálculo
      if (correctAnswer.includes('x^')) {
        // Manipular exponentes o coeficientes
        const parts = correctAnswer.split('x^');
        const coefficient = parseInt(parts[0]) || 1;
        const exponent = parseInt(parts[1]) || 1;
        
        options.push(`${coefficient + 1}x^${exponent}`);
        options.push(`${coefficient}x^${exponent + 1}`);
        options.push(`${coefficient - 1}x^${exponent - 1}`);
      } else if (correctAnswer.includes('sin') || correctAnswer.includes('cos')) {
        // Para funciones trigonométricas
        if (correctAnswer.includes('sin')) {
          options.push('cos(x)');
          options.push('-sin(x)');
          options.push('tan(x)');
        } else {
          options.push('sin(x)');
          options.push('-cos(x)');
          options.push('tan(x)');
        }
      } else {
        // Opciones genéricas
        const value = parseInt(correctAnswer) || 1;
        options.push(`${value + 1}`);
        options.push(`${value - 1}`);
        options.push(`${value * 2}`);
      }
    } else {
      // Para problemas de gráficas
      const func = this.currentProblem.selectedFunction;
      options = [
        func.derivativeEq,            // Correcta
        `${func.originalEq}`,         // Original
        `-${func.derivativeEq}`,      // Negativo
        `(${func.derivativeEq})^2`    // Cuadrado
      ];
    }
    
    // Mezclar opciones
    return this.shuffleArray(options);
  }
  
  // Mezclar array (algoritmo Fisher-Yates)
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  // Manejar la selección de una respuesta
  selectOption(index) {
    this.selectedOption = index;
    this.drawGame(); // Redibujar para mostrar la selección
  }
  
  // Verificar la respuesta seleccionada
  checkAnswer() {
    if (this.selectedOption === -1) {
      this.log('Por favor, selecciona una respuesta primero');
      return;
    }
    
    const selectedAnswer = this.options[this.selectedOption];
    const correctAnswer = this.currentProblem.answer;
    
    const isCorrect = selectedAnswer === correctAnswer;
    
    if (isCorrect) {
      this.score += this.currentProblem.difficulty * 10;
      this.problemsSolved++;
      this.log(`¡Correcto! +${this.currentProblem.difficulty * 10} puntos`);
      
      // Subir de nivel cada 3 problemas resueltos
      if (this.problemsSolved % 3 === 0) {
        this.level++;
        this.log(`¡Has subido al nivel ${this.level}!`);
      }
    } else {
      this.lives--;
      this.log(`Incorrecto. La respuesta correcta era: ${correctAnswer}`);
      
      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
    }
    
    this.answers.push({
      question: this.currentProblem.question,
      userAnswer: selectedAnswer,
      correctAnswer: correctAnswer,
      isCorrect: isCorrect
    });
    
    // Generar nuevo problema
    this.generateProblem();
  }
  
  // Terminar el juego
  gameOver() {
    this.isGameOver = true;
    this.log('********** JUEGO TERMINADO **********');
    this.log(`Puntuación final: ${this.score}`);
    this.log(`Problemas resueltos: ${this.problemsSolved}`);
    this.log(`Nivel alcanzado: ${this.level}`);
    this.drawGame(); // Actualizar pantalla
  }
  
  // Actualización principal del juego
  update() {
    if (!this.isGameOver && !this.isPaused) {
      // Actualizar tiempo
      if (this.timeRemaining > 0) {
        this.timeRemaining -= 0.1;
      } else {
        this.lives--;
        this.log('¡Se acabó el tiempo!');
        
        if (this.lives <= 0) {
          this.gameOver();
        } else {
          this.generateProblem();
        }
      }
      
      // Dibujar el juego
      this.drawGame();
      
      // Continuar el bucle
      requestAnimationFrame(() => this.update());
    }
  }
  
  // Dibujar el estado actual del juego
  drawGame() {
    // Limpiar canvas
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Dibujar información del juego (parte superior)
    this.drawGameInfo();
    
    // Dibujar problema actual
    if (this.isGameOver) {
      this.drawGameOver();
    } else {
      this.drawProblem();
    }
    
    // Dibujar barra de tiempo
    this.drawTimeBar();
    
    // Dibujar opciones
    this.drawOptions();
  }
  
  // Dibujar información del juego
  drawGameInfo() {
    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Nivel: ${this.level}`, 20, 40);
    
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Puntuación: ${this.score}`, this.width / 2, 40);
    
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Vidas: ${'❤️'.repeat(this.lives)}`, this.width - 20, 40);
  }
  
  // Dibujar el problema actual
  drawProblem() {
    const problem = this.currentProblem;
    if (!problem) return;
    
    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(problem.question, this.width / 2, 120);
    
    if (this.gameType === 'graph' && problem.type === 'identify-graph') {
      this.drawGraphs();
    }
  }
  
  // Dibujar gráficas para problemas de tipo gráfico
  drawGraphs() {
    const func = this.currentProblem.selectedFunction;
    const graphWidth = this.width / 2 - 40;
    const graphHeight = 200;
    const originY = 250;
    
    // Gráfica 1: Función original
    this.drawGraph(40, originY, graphWidth, graphHeight, func.original, 'f(x)');
    
    // Gráfica 2: Derivada
    this.drawGraph(this.width / 2 + 20, originY, graphWidth, graphHeight, func.derivative, "f'(x)");
  }
  
  // Dibujar una gráfica específica
  drawGraph(x, y, width, height, func, label) {
    const scaleX = width / 8; // -4 a 4
    const scaleY = height / 4; // -2 a 2
    
    // Dibujar ejes
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    
    // Eje X
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + width, y);
    
    // Eje Y
    this.ctx.moveTo(x + width / 2, y - height / 2);
    this.ctx.lineTo(x + width / 2, y + height / 2);
    this.ctx.stroke();
    
    // Dibujar función
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const graphX = -4 + t * 8; // Rango de x: -4 a 4
        const graphY = func(graphX);
        
        // Convertir a coordenadas del canvas
        const canvasX = x + (graphX + 4) * scaleX;
        const canvasY = y - graphY * scaleY;
        
        if (i === 0) {
            this.ctx.moveTo(canvasX, canvasY);
        } else {
            this.ctx.lineTo(canvasX, canvasY);
        }
    }
    this.ctx.stroke();
    
    // Etiqueta
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(label, x + width / 2, y + height / 2 + 30);
  }
  
  // Dibujar barra de tiempo
  drawTimeBar() {
    const barWidth = this.width - 40;
    const barHeight = 20;
    const x = 20;
    const y = 70;
    
    // Fondo de la barra
    this.ctx.fillStyle = '#444';
    this.ctx.fillRect(x, y, barWidth, barHeight);
    
    // Barra de tiempo
    const timePercentage = Math.max(0, this.timeRemaining / 30);
    this.ctx.fillStyle = this.colors.timeBar;
    this.ctx.fillRect(x, y, barWidth * timePercentage, barHeight);
    
    // Texto
    this.ctx.fillStyle = '#000';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Tiempo: ${Math.ceil(this.timeRemaining)}s`, x + barWidth / 2, y + 15);
  }
  
  // Dibujar opciones de respuesta
  drawOptions() {
    const numOptions = this.options.length;
    const optionHeight = 60;
    const optionWidth = this.width - 40;
    const startY = 380;
    const spacing = 20;
    
    for (let i = 0; i < numOptions; i++) {
      const x = 20;
      const y = startY + i * (optionHeight + spacing);
      
      // Color de fondo según selección
      if (i === this.selectedOption) {
        this.ctx.fillStyle = this.colors.buttonHover;
      } else {
        this.ctx.fillStyle = this.colors.button;
      }
      
      // Dibujar botón
      this.ctx.fillRect(x, y, optionWidth, optionHeight);
      
      // Texto de la opción
      this.ctx.fillStyle = this.colors.text;
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.options[i], x + optionWidth / 2, y + optionHeight / 2 + 7);
    }
  }
  
  // Dibujar pantalla de fin de juego
  drawGameOver() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('¡JUEGO TERMINADO!', this.width / 2, 200);
    
    this.ctx.font = '32px Arial';
    this.ctx.fillText(`Puntuación final: ${this.score}`, this.width / 2, 280);
    this.ctx.fillText(`Nivel alcanzado: ${this.level}`, this.width / 2, 330);
    this.ctx.fillText(`Problemas resueltos: ${this.problemsSolved}`, this.width / 2, 380);
    
    // Botón para reiniciar
    this.ctx.fillStyle = this.colors.button;
    const restartButtonWidth = 200;
    const restartButtonHeight = 60;
    const restartButtonX = (this.width - restartButtonWidth) / 2;
    const restartButtonY = 450;
    
    this.ctx.fillRect(restartButtonX, restartButtonY, restartButtonWidth, restartButtonHeight);
    
    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Jugar de nuevo', this.width / 2, restartButtonY + 37);
  }
  
  // Configurar escuchadores de eventos
  setupEventListeners() {
    // Evento de clic para opciones y botones
    this.canvas.addEventListener('click', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      if (this.isGameOver) {
        // Verificar clic en botón de reinicio
        const restartButtonWidth = 200;
        const restartButtonHeight = 60;
        const restartButtonX = (this.width - restartButtonWidth) / 2;
        const restartButtonY = 450;
        
        if (x >= restartButtonX && x <= restartButtonX + restartButtonWidth &&
            y >= restartButtonY && y <= restartButtonY + restartButtonHeight) {
          this.restartGame();
        }
      } else {
        // Verificar clic en opciones
        const numOptions = this.options.length;
        const optionHeight = 60;
        const optionWidth = this.width - 40;
        const startY = 380;
        const spacing = 20;
        
        for (let i = 0; i < numOptions; i++) {
          const optionX = 20;
          const optionY = startY + i * (optionHeight + spacing);
          
          if (x >= optionX && x <= optionX + optionWidth &&
              y >= optionY && y <= optionY + optionHeight) {
            this.selectOption(i);
            this.checkAnswer();
            break;
          }
        }
      }
    });
    
    // Evento para teclas (números para seleccionar opciones)
    document.addEventListener('keydown', (event) => {
      if (this.isGameOver) return;
      
      // Teclas 1-4 para seleccionar opciones
      if (event.key >= '1' && event.key <= '4') {
        const index = parseInt(event.key) - 1;
        if (index < this.options.length) {
          this.selectOption(index);
          this.checkAnswer();
        }
      }
      
      // Tecla Enter para confirmar selección
      if (event.key === 'Enter' && this.selectedOption !== -1) {
        this.checkAnswer();
      }
    });
  }
  
  // Reiniciar el juego
  restartGame() {
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.isGameOver = false;
    this.isPaused = false;
    this.timeRemaining = 30;
    this.problemsSolved = 0;
    this.answers = [];
    
    this.log('Juego reiniciado');
    this.generateProblem();
    this.update();
  }
  
  // Añadir mensaje al output
  log(message) {
    if (this.outputElement) {
      const line = document.createElement('div');
      line.textContent = message;
      this.outputElement.appendChild(line);
      this.outputElement.scrollTop = this.outputElement.scrollHeight;
      console.log(message);
    }
  }
} 