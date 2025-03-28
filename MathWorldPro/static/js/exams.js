/**
 * Mathematical World - Exams JavaScript
 * Handles exam functionality, question display, scoring, and feedback
 */

// Exam state
let currentExam = {
    type: '',
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: [],
    score: 0
};

// DOM Elements
let examElements = {};

document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    cacheExamElements();

    // Add event listeners
    addExamEventListeners();

    // Translate retake and other exam buttons if they exist
    if (examElements.retakeButton) {
        examElements.retakeButton.textContent = 'Volver a Intentar';
    }
    if (examElements.chooseAnotherButton) {
        examElements.chooseAnotherButton.textContent = 'Elegir Otro Examen';
    }
});

/**
 * Cache DOM elements for exam functionality
 */
function cacheExamElements() {
    examElements = {
        examType: document.getElementById('examType'),
        startExamBtn: document.getElementById('startExamBtn'),
        examContainer: document.getElementById('examContainer'),
        examTitle: document.getElementById('examTitle'),
        questionCounter: document.getElementById('questionCounter'),
        examProgressBar: document.getElementById('examProgressBar'),
        questionContainer: document.getElementById('questionContainer'),
        questionText: document.getElementById('questionText'),
        questionImage: document.getElementById('questionImage'),
        answerOptions: document.getElementById('answerOptions'),
        answerFeedback: document.getElementById('answerFeedback'),
        feedbackTitle: document.getElementById('feedbackTitle'),
        feedbackText: document.getElementById('feedbackText'),
        explanationText: document.getElementById('explanationText'),
        prevQuestionBtn: document.getElementById('prevQuestionBtn'),
        nextQuestionBtn: document.getElementById('nextQuestionBtn'),
        examResults: document.getElementById('examResults'),
        scoreValue: document.getElementById('scoreValue'),
        scorePercentage: document.getElementById('scorePercentage'),
        scoreMessage: document.getElementById('scoreMessage'),
        questionsReview: document.getElementById('questionsReview'),
        retakeExamBtn: document.getElementById('retakeExamBtn'),
        chooseAnotherExamBtn: document.getElementById('chooseAnotherExamBtn')
    };
}

/**
 * Add event listeners for exam functionality
 */
function addExamEventListeners() {
    // Start exam button
    if (examElements.startExamBtn) {
        examElements.startExamBtn.addEventListener('click', startExam);
    }

    // Navigation buttons
    if (examElements.prevQuestionBtn) {
        examElements.prevQuestionBtn.addEventListener('click', showPreviousQuestion);
    }

    if (examElements.nextQuestionBtn) {
        examElements.nextQuestionBtn.addEventListener('click', handleNextQuestion);
    }

    // Results screen buttons
    if (examElements.retakeExamBtn) {
        examElements.retakeExamBtn.addEventListener('click', retakeExam);
    }

    if (examElements.chooseAnotherExamBtn) {
        examElements.chooseAnotherExamBtn.addEventListener('click', chooseAnotherExam);
    }
}

/**
 * Start a new exam based on the selected type
 */
function startExam() {
    const examType = examElements.examType.value;

    // Generate questions based on exam type
    const questions = generateExamQuestions(examType);

    // Set up the current exam
    currentExam = {
        type: examType,
        questions: questions,
        currentQuestionIndex: 0,
        userAnswers: Array(questions.length).fill(null),
        score: 0
    };

    // Show the first question
    displayCurrentQuestion();

    // Hide selection and show exam
    document.querySelector('.exam-selection').classList.add('d-none');
    examElements.examContainer.classList.remove('d-none');

    // Update exam title
    examElements.examTitle.textContent = getExamTitle(examType);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Get exam title based on exam type
 */
function getExamTitle(examType) {
    const titles = {
        'all': 'Examen Completo de Cálculo Diferencial',
        'intro': 'Examen de Introducción al Cálculo',
        'derivatives': 'Examen de Derivadas y Reglas',
        'factorization': 'Examen de Métodos de Factorización',
        'graphs': 'Examen de Gráficas y Funciones',
        'limits': 'Examen de Límites y Continuidad',
        'extrema': 'Examen de Valores Extremos y Puntos Críticos',
        'applications': 'Examen de Aplicaciones del Cálculo',
        'mvt': 'Examen de Formas Indeterminadas y Teorema del Valor Medio'
    };

    return titles[examType] || 'Differential Calculus Exam';
}

/**
 * Display the current question
 */
function displayCurrentQuestion() {
    const currentQuestion = currentExam.questions[currentExam.currentQuestionIndex];
    const userAnswer = currentExam.userAnswers[currentExam.currentQuestionIndex];

    // Update question text
    examElements.questionText.innerHTML = currentQuestion.question;

    // Update question image if provided
    if (currentQuestion.image) {
        examElements.questionImage.innerHTML = currentQuestion.image;
        examElements.questionImage.classList.remove('d-none');
    } else {
        examElements.questionImage.classList.add('d-none');
    }

    // Update question counter
    examElements.questionCounter.textContent = `Pregunta ${currentExam.currentQuestionIndex + 1} de ${currentExam.questions.length}`;

    // Update progress bar
    const progressPercentage = ((currentExam.currentQuestionIndex + 1) / currentExam.questions.length) * 100;
    examElements.examProgressBar.style.width = `${progressPercentage}%`;
    examElements.examProgressBar.setAttribute('aria-valuenow', progressPercentage);
    examElements.examProgressBar.textContent = `${Math.round(progressPercentage)}%`;

    // Generate answer options
    generateAnswerOptions(currentQuestion, userAnswer);

    // Update button states
    updateNavigationButtons();

    // Hide feedback if showing a new question
    examElements.answerFeedback.classList.add('d-none');

    // Apply LaTeX rendering for mathematical expressions
    if (typeof MathJax !== 'undefined') {
        // Para MathJax versión 3
        if (typeof MathJax.typeset === 'function') {
            MathJax.typeset();
        } 
        // Para compatibilidad con MathJax versión 2 (fallback)
        else if (MathJax.Hub && typeof MathJax.Hub.Queue === 'function') {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        }
    }
}

/**
 * Generate answer options for the current question
 */
function generateAnswerOptions(question, selectedAnswer) {
    // Clear previous options
    examElements.answerOptions.innerHTML = '';

    // Create options
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option-item';
        optionElement.setAttribute('data-index', index);

        // If there's a selected answer, highlight accordingly
        if (selectedAnswer !== null) {
            if (index === selectedAnswer) {
                if (index === question.correctAnswer) {
                    optionElement.classList.add('correct');
                } else {
                    optionElement.classList.add('incorrect');
                }
            } else if (index === question.correctAnswer) {
                optionElement.classList.add('correct');
            }
        } else if (index === selectedAnswer) {
            optionElement.classList.add('selected');
        }

        // Create radio button
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'answer';
        radio.value = index;
        radio.className = 'option-radio';
        radio.checked = selectedAnswer === index;
        radio.disabled = selectedAnswer !== null;

        // Create option text
        const optionText = document.createElement('span');
        optionText.innerHTML = option;

        // Append elements
        optionElement.appendChild(radio);
        optionElement.appendChild(optionText);

        // Add click handler
        if (selectedAnswer === null) {
            optionElement.addEventListener('click', () => selectAnswer(index));
        }

        examElements.answerOptions.appendChild(optionElement);
    });
}

/**
 * Select an answer for the current question
 */
function selectAnswer(index) {
    const currentQuestionIndex = currentExam.currentQuestionIndex;
    const currentQuestion = currentExam.questions[currentQuestionIndex];

    // Store the user's answer
    currentExam.userAnswers[currentQuestionIndex] = index;

    // Mark options as selected/correct/incorrect
    const options = examElements.answerOptions.querySelectorAll('.option-item');

    options.forEach((option, optionIndex) => {
        const radio = option.querySelector('input[type="radio"]');

        // Disable all radios
        radio.disabled = true;

        if (optionIndex === index) {
            option.classList.add(optionIndex === currentQuestion.correctAnswer ? 'correct' : 'incorrect');
            radio.checked = true;
        } else if (optionIndex === currentQuestion.correctAnswer) {
            option.classList.add('correct');
        }
    });

    // Show feedback
    showAnswerFeedback(index === currentQuestion.correctAnswer);

    // Update button text if this is the last question
    if (currentQuestionIndex === currentExam.questions.length - 1) {
        examElements.nextQuestionBtn.textContent = 'Finalizar Examen';
    }
}

/**
 * Show feedback for the selected answer
 */
function showAnswerFeedback(isCorrect) {
    const currentQuestion = currentExam.questions[currentExam.currentQuestionIndex];

    // Set feedback content
    if (isCorrect) {
        examElements.feedbackTitle.textContent = '¡Correcto!';
        examElements.feedbackText.textContent = '¡Buen trabajo! Tu respuesta es correcta.';
        examElements.answerFeedback.className = 'feedback-container mt-4 alert alert-success';
    } else {
        examElements.feedbackTitle.textContent = 'Incorrecto';
        examElements.feedbackText.textContent = 'No es del todo correcto. Revisa la explicación a continuación.';
        examElements.answerFeedback.className = 'feedback-container mt-4 alert alert-danger';
    }

    // Add explanation
    examElements.explanationText.innerHTML = currentQuestion.explanation;

    // Show feedback container
    examElements.answerFeedback.classList.remove('d-none');

    // Apply LaTeX rendering for mathematical expressions in the explanation
    if (typeof MathJax !== 'undefined') {
        // Para MathJax versión 3
        if (typeof MathJax.typeset === 'function') {
            MathJax.typeset([examElements.explanationText]);
        } 
        // Para compatibilidad con MathJax versión 2 (fallback)
        else if (MathJax.Hub && typeof MathJax.Hub.Queue === 'function') {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, examElements.explanationText]);
        }
    }
}

/**
 * Show the previous question
 */
function showPreviousQuestion() {
    if (currentExam.currentQuestionIndex > 0) {
        currentExam.currentQuestionIndex--;
        displayCurrentQuestion();
    }
}

/**
 * Handle next question button click
 */
function handleNextQuestion() {
    const currentIndex = currentExam.currentQuestionIndex;

    // If user hasn't answered the current question
    if (currentExam.userAnswers[currentIndex] === null) {
        // Move to next question without requiring an answer
        if (currentIndex < currentExam.questions.length - 1) {
            currentExam.currentQuestionIndex++;
            displayCurrentQuestion();
        } else {
            // Finish the exam if this was the last question
            finishExam();
        }
        return;
    }

    // If not the last question, show next question
    if (currentIndex < currentExam.questions.length - 1) {
        currentExam.currentQuestionIndex++;
        displayCurrentQuestion();
    } else {
        // This is the last question, finish the exam
        finishExam();
    }
}

/**
 * Update the navigation buttons based on current question
 */
function updateNavigationButtons() {
    // Previous button is disabled on the first question
    examElements.prevQuestionBtn.disabled = currentExam.currentQuestionIndex === 0;

    // Update next button text
    if (currentExam.currentQuestionIndex === currentExam.questions.length - 1) {
        examElements.nextQuestionBtn.textContent = 'Finalizar Examen';
    } else {
        examElements.nextQuestionBtn.textContent = 'Siguiente Pregunta';
    }
}

/**
 * Finish the exam and show results
 */
function finishExam() {
    // Calculate score
    calculateScore();

    // Hide exam container
    examElements.examContainer.classList.add('d-none');

    // Show results container
    examElements.examResults.classList.remove('d-none');

    // Update results display
    updateResultsDisplay();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Calculate the final score
 */
function calculateScore() {
    let correctAnswers = 0;

    for (let i = 0; i < currentExam.questions.length; i++) {
        if (currentExam.userAnswers[i] === currentExam.questions[i].correctAnswer) {
            correctAnswers++;
        }
    }

    currentExam.score = correctAnswers;
}

/**
 * Update the results display
 */
function updateResultsDisplay() {
    const totalQuestions = currentExam.questions.length;
    const score = currentExam.score;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Update score display
    examElements.scoreValue.textContent = `${score}/${totalQuestions}`;
    examElements.scorePercentage.textContent = `${percentage}%`;
    examElements.scorePercentage.classList.add('animate-score');

    // Update score message
    if (percentage >= 90) {
        examElements.scoreMessage.textContent = '¡Excelente! Tienes una fuerte comprensión del material!';
    } else if (percentage >= 75) {
        examElements.scoreMessage.textContent = '¡Buen trabajo! Tienes un sólido entendimiento de la mayoría de los conceptos.';
    } else if (percentage >= 60) {
        examElements.scoreMessage.textContent = '¡Has aprobado! Continúa practicando para mejorar tu comprensión.';
    } else {
        examElements.scoreMessage.textContent = '¡Sigue estudiando! Revisa los conceptos e inténtalo nuevamente.';
    }

    // Generate questions review
    generateQuestionsReview();
}

/**
 * Generate the questions review section
 */
function generateQuestionsReview() {
    // Clear previous content
    examElements.questionsReview.innerHTML = '';

    // Add each question to the review
    currentExam.questions.forEach((question, index) => {
        const userAnswer = currentExam.userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;

        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';

        // Question title with badge
        const questionTitle = document.createElement('h5');
        questionTitle.innerHTML = `Pregunta ${index + 1}: ${question.question}`;

        const badge = document.createElement('span');
        badge.className = `badge ${isCorrect ? 'bg-success' : 'bg-danger'}`;
        badge.textContent = isCorrect ? 'Correcto' : 'Incorrecto';
        questionTitle.appendChild(badge);

        // User's answer
        const userAnswerDiv = document.createElement('div');
        userAnswerDiv.className = 'review-answer';

        const userAnswerTitle = document.createElement('h6');
        userAnswerTitle.textContent = 'Tu Respuesta:';

        const userAnswerText = document.createElement('p');
        if (userAnswer !== null) {
            userAnswerText.innerHTML = question.options[userAnswer];
        } else {
            userAnswerText.textContent = 'No se proporcionó respuesta';
        }

        // Correct answer (if wrong)
        const correctAnswerDiv = document.createElement('div');
        correctAnswerDiv.className = 'review-answer';

        const correctAnswerTitle = document.createElement('h6');
        correctAnswerTitle.textContent = 'Respuesta Correcta:';

        const correctAnswerText = document.createElement('p');
        correctAnswerText.innerHTML = question.options[question.correctAnswer];

        // Explanation
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'review-explanation mt-3';

        const explanationTitle = document.createElement('h6');
        explanationTitle.textContent = 'Explicación:';

        const explanationText = document.createElement('p');
        explanationText.innerHTML = question.explanation;

        // Assemble the review item
        reviewItem.appendChild(questionTitle);

        userAnswerDiv.appendChild(userAnswerTitle);
        userAnswerDiv.appendChild(userAnswerText);
        reviewItem.appendChild(userAnswerDiv);

        if (!isCorrect) {
            correctAnswerDiv.appendChild(correctAnswerTitle);
            correctAnswerDiv.appendChild(correctAnswerText);
            reviewItem.appendChild(correctAnswerDiv);
        }

        explanationDiv.appendChild(explanationTitle);
        explanationDiv.appendChild(explanationText);
        reviewItem.appendChild(explanationDiv);

        examElements.questionsReview.appendChild(reviewItem);
    });

    // Apply LaTeX rendering for mathematical expressions
    if (typeof MathJax !== 'undefined') {
        // Para MathJax versión 3
        if (typeof MathJax.typeset === 'function') {
            MathJax.typeset([examElements.questionsReview]);
        } 
        // Para compatibilidad con MathJax versión 2 (fallback)
        else if (MathJax.Hub && typeof MathJax.Hub.Queue === 'function') {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, examElements.questionsReview]);
        }
    }
}

/**
 * Retake the current exam
 */
function retakeExam() {
    // Reset user answers and score
    currentExam.userAnswers = Array(currentExam.questions.length).fill(null);
    currentExam.score = 0;
    currentExam.currentQuestionIndex = 0;

    // Hide results and show exam container
    examElements.examResults.classList.add('d-none');
    examElements.examContainer.classList.remove('d-none');

    // Display the first question
    displayCurrentQuestion();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Choose another exam type
 */
function chooseAnotherExam() {
    // Reset the current exam
    currentExam = {
        type: '',
        questions: [],
        currentQuestionIndex: 0,
        userAnswers: [],
        score: 0
    };

    // Hide results
    examElements.examResults.classList.add('d-none');

    // Show exam selection
    document.querySelector('.exam-selection').classList.remove('d-none');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Generate exam questions based on the selected type
 */
function generateExamQuestions(examType) {
    let questions = [];

    // Get questions based on exam type
    switch (examType) {
        case 'intro':
            questions = getIntroductionQuestions();
            break;
        case 'derivatives':
            questions = getDerivativesQuestions();
            break;
        case 'factorization':
            questions = getFactorizationQuestions();
            break;
        case 'graphs':
            questions = getGraphsQuestions();
            break;
        case 'limits':
            questions = getLimitsQuestions();
            break;
        case 'extrema':
            questions = getExtremaQuestions();
            break;
        case 'applications':
            questions = getApplicationsQuestions();
            break;
        case 'mvt':
            questions = getMVTQuestions();
            break;
        case 'all':
        default:
            // For comprehensive exam, select 2 from each category
            questions = getComprehensiveQuestions();
    }

    return questions;
}

/**
 * Get questions for a comprehensive exam
 */
function getComprehensiveQuestions() {
    const allQuestions = [
        ...getIntroductionQuestions(),
        ...getDerivativesQuestions(),
        ...getFactorizationQuestions(),
        ...getGraphsQuestions(),
        ...getLimitsQuestions(),
        ...getExtremaQuestions(),
        ...getApplicationsQuestions(),
        ...getMVTQuestions()
    ];

    // Shuffle and select 10 questions
    return shuffleArray(allQuestions).slice(0, 10);
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Questions for Introduction to Calculus
 */
function getIntroductionQuestions() {
    return [
        {
            question: "¿Qué es el cálculo diferencial?",
            options: [
                "Una rama de las matemáticas que estudia el cambio continuo",
                "Un método para resolver ecuaciones algebraicas",
                "Una forma de contar números",
                "Un sistema de geometría básica"
            ],
            correctAnswer: 0,
            explanation: "El cálculo diferencial es una rama fundamental de las matemáticas que estudia cómo cambian las cantidades de forma continua, siendo esencial para entender tasas de cambio y optimización."
        },
        {
            question: "¿A quién se le atribuye el desarrollo independiente del cálculo junto con Gottfried Wilhelm Leibniz?",
            options: [
                "Leonhard Euler",
                "Carl Friedrich Gauss",
                "Isaac Newton",
                "Pierre de Fermat"
            ],
            correctAnswer: 2,
            explanation: "A Isaac Newton se le atribuye el desarrollo independiente del cálculo junto con Gottfried Wilhelm Leibniz. Newton desarrolló su método de fluxiones (cálculo) a mediados de la década de 1660."
        },
        {
            question: "¿Cuál es la relación entre velocidad y posición en términos de cálculo?",
            options: [
                "La velocidad es la integral de la posición",
                "La velocidad es la derivada de la posición",
                "La velocidad es la raíz cuadrada de la posición",
                "La velocidad es el logaritmo de la posición"
            ],
            correctAnswer: 1,
            explanation: "La velocidad es la derivada de la posición con respecto al tiempo. Si denotamos la posición como s(t), entonces la velocidad v(t) = ds/dt, representando la tasa instantánea de cambio de la posición."
        },
        {
            question: "¿Cuál de las siguientes NO es una aplicación del cálculo diferencial?",
            options: [
                "Encontrar valores máximos y mínimos",
                "Calcular volúmenes de sólidos tridimensionales",
                "Determinar tasas de cambio",
                "Encontrar rectas tangentes a curvas"
            ],
            correctAnswer: 1,
            explanation: "Calcular volúmenes de sólidos tridimensionales es principalmente una aplicación del cálculo integral, no del cálculo diferencial. El cálculo diferencial se utiliza para encontrar tasas de cambio, rectas tangentes y extremos."
        },
        {
            question: "¿Cuál es la definición de la derivada en términos de límites?",
            options: [
                "\\(f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}\\)",
                "\\(f'(x) = \\lim_{h \\to 0} \\frac{f(x) - f(h)}{x-h}\\)",
                "\\(f'(x) = \\lim_{h \\to 0} \\frac{f(x) \\cdot f(h)}{h}\\)",
                "\\(f'(x) = \\lim_{h \\to 0} [f(x+h) - f(x)]\\)"
            ],
            correctAnswer: 0,
            explanation: "La derivada se define como el límite del cociente de diferencias: \\(f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}\\). Esto representa la tasa instantánea de cambio de la función en el punto x."
        }
    ];
}

/**
 * Questions for Derivatives and Rules
 */
function getDerivativesQuestions() {
    return [
        {
            question: "¿Cuál es la derivada de \\(f(x) = x^3\\)?",
            options: [
                "\\(f'(x) = 3x^2\\)",
                "\\(f'(x) = x^2\\)",
                "\\(f'(x) = 3x^4\\)",
                "\\(f'(x) = \\frac{1}{3}x^2\\)"
            ],
            correctAnswer: 0,
            explanation: "Usando la regla de potencia para derivadas: \\(\\frac{d}{dx}[x^n] = nx^{n-1}\\). Para \\(f(x) = x^3\\), obtenemos \\(f'(x) = 3x^{3-1} = 3x^2\\)."
        },
        {
            question: "Si \\(f(x) = 5x^2 + 3x - 7\\), ¿cuál es \\(f'(x)\\)?",
            options: [
                "\\(f'(x) = 10x + 3\\)",
                "\\(f'(x) = 5x + 3\\)",
                "\\(f'(x) = 10x^2 + 3\\)",
                "\\(f'(x) = 10x - 7\\)"
            ],
            correctAnswer: 0,
            explanation: "Para encontrar la derivada, aplicamos la regla de potencia y la regla de suma:<br>\\(f(x) = 5x^2 + 3x - 7\\)<br>\\(f'(x) = 5 \\cdot 2x^{2-1} + 3 \\cdot 1x^{1-1} - 0\\)<br>\\(f'(x) = 10x + 3\\)"
        },
        {
            question: "¿Cuál es la derivada de \\(g(x) = e^x\\)?",
            options: [
                "\\(g'(x) = e^x\\)",
                "\\(g'(x) = xe^{x-1}\\)",
                "\\(g'(x) = e^{x-1}\\)",
                "\\(g'(x) = \\frac{1}{e^x}\\)"
            ],
            correctAnswer: 0,
            explanation: "La función exponencial \\(e^x\\) tiene la propiedad especial de ser su propia derivada: \\(\\frac{d}{dx}[e^x] = e^x\\). Esta es una de las razones por las que \\(e\\) es una constante tan importante en matemáticas."
        },
        {
            question: "¿Cuál es la regla que se utiliza para hallar la derivada de \\(h(x) = f(x) \\cdot g(x)\\)?",
            options: [
                "Regla de la Cadena",
                "Regla del Producto",
                "Regla del Cociente",
                "Regla de la Potencia"
            ],
            correctAnswer: 1,
            explanation: "Para hallar la derivada de un producto de dos funciones, usamos la Regla del Producto: \\(\\frac{d}{dx}[f(x) \\cdot g(x)] = f'(x) \\cdot g(x) + f(x) \\cdot g'(x)\\)"
        },
        {
            question: "Usando la regla de la cadena, ¿cuál es la derivada de \\(f(x) = \\sin(x^2)\\)?",
            options: [
                "\\(f'(x) = \\cos(x^2)\\)",
                "\\(f'(x) = 2x\\cos(x^2)\\)",
                "\\(f'(x) = 2\\sin(x)\\cos(x)\\)",
                "\\(f'(x) = 2x^2\\cos(x^2)\\)"
            ],
            correctAnswer: 1,
            explanation: "Usando la regla de la cadena: \\(\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)\\)<br>Aquí, \\(f(x) = \\sin(x^2)\\) donde \\(g(x) = x^2\\)<br>\\(f'(x) = \\cos(x^2) \\cdot \\frac{d}{dx}[x^2] = \\cos(x^2) \\cdot 2x = 2x\\cos(x^2)\\)"
        }
    ];
}

/**
 * Questions for Factorization Methods
 */
function getFactorizationQuestions() {
    return [
        {
            question: "¿Qué factorización se puede utilizar para la expresión \\(x^2 - 9\\)?",
            options: [
                "\\((x-3)^2\\)",
                "\\((x-3)(x+3)\\)",
                "\\((x^2-3)(x^2+3)\\)",
                "\\((x-9)(x+1)\\)"
            ],
            correctAnswer: 1,
            explanation: "La expresión \\(x^2 - 9\\) es una diferencia de cuadrados: \\(x^2 - 3^2\\)<br>Usando la fórmula \\(a^2 - b^2 = (a-b)(a+b)\\), obtenemos: \\(x^2 - 9 = (x-3)(x+3)\\)"
        },
        {
            question: "Factoriza completamente la expresión \\(x^3 + 8\\).",
            options: [
                "\\((x+2)(x^2-2x+4)\\)",
                "\\((x+2)(x^2+2x+4)\\)",
                "\\((x-2)(x^2+2x+4)\\)",
                "\\((x-2)(x^2-2x+4)\\)"
            ],
            correctAnswer: 0,
            explanation: "La expresión \\(x^3 + 8\\) es una suma de cubos: \\(x^3 + 2^3\\)<br>Usando la fórmula \\(a^3 + b^3 = (a+b)(a^2-ab+b^2)\\), obtenemos: \\(x^3 + 8 = (x+2)(x^2-2x+4)\\)"
        },
        {
            question: "¿Cuál es el primer paso para factorizar \\(6x^2 + 11x - 10\\) por agrupación?",
            options: [
                "Encontrar dos números que sumen 11 y multipliquen -10",
                "Encontrar dos números que sumen 11 y multipliquen -60",
                "Encontrar dos números que sumen 11 y multipliquen 60",
                "Encontrar dos números que sumen 6 y multipliquen -10"
            ],
            correctAnswer: 1,
            explanation: "Al factorizar \\(ax^2 + bx + c\\) por agrupación, necesitamos encontrar dos números que sumen b y multipliquen a*c.<br>Aquí, a = 6, b = 11, c = -10<br>Así que necesitamos dos números que sumen 11 y multipliquen 6*(-10) = -60."
        },
        {
            question: "Completa el cuadrado para la expresión \\(x^2 - 6x\\).",
            options: [
                "\\((x - 3)^2 - 9\\)",
                "\\((x - 3)^2 + 9\\)",
                "\\((x + 3)^2 - 9\\)",
                "\\((x - 3)^2\\)"
            ],
            correctAnswer: 0,
            explanation: "Para completar el cuadrado para \\(x^2 - 6x\\):<br>1. Toma la mitad del coeficiente de x: -6/2 = -3<br>2. Eleva al cuadrado: (-3)^2 = 9<br>3. Suma y resta este valor: \\(x^2 - 6x + 9 - 9\\)<br>4. Factoriza el trinomio cuadrado perfecto: \\((x - 3)^2 - 9\\)"
        },
        {
            question: "¿Qué técnica de factorización sería más eficiente para \\(4x^2 - 25\\)?",
            options: [
                "Agrupación de términos",
                "Diferencia de cuadrados",
                "Completando el cuadrado",
                "Factorización cúbica"
            ],
            correctAnswer: 1,
            explanation: "La expresión \\(4x^2 - 25\\) se puede escribir como \\((2x)^2 - 5^2\\), que es una diferencia de cuadrados. La factorización más eficiente es usar la fórmula \\(a^2 - b^2 = (a-b)(a+b)\\) para obtener \\((2x-5)(2x+5)\\)."
        }
    ];
}

/**
 * Questions for Graphs and Functions
 */
function getGraphsQuestions() {
    return [
        {
            question: "¿Qué nos dice la primera derivada sobre la gráfica de una función?",
            options: [
                "La concavidad de la función",
                "La pendiente o tasa de cambio de la función",
                "El área bajo la curva",
                "El volumen de revolución"
            ],
            correctAnswer: 1,
            explanation: "La primera derivada \\(f'(x)\\) nos informa sobre la pendiente o tasa de cambio instantánea de la función en cualquier punto dado. Indica dónde la función está aumentando (\\(f'(x) > 0\\)) o disminuyendo (\\(f'(x) < 0\\))."
        },
        {
            question: "¿Qué información proporciona la segunda derivada sobre la gráfica de una función?",
            options: [
                "El valor de la función en un punto dado",
                "La tasa de crecimiento de la función",
                "La concavidad de la función",
                "El dominio de la función"
            ],
            correctAnswer: 2,
            explanation: "La segunda derivada \\(f''(x)\\) proporciona información sobre la concavidad de la gráfica de la función. Cuando \\(f''(x) > 0\\), la gráfica es cóncava hacia arriba (como una taza), y cuando \\(f''(x) < 0\\), la gráfica es cóncava hacia abajo (como una tapa)."
        },
        {
            question: "¿Cuál de las siguientes funciones tiene una gráfica que siempre está aumentando?",
            options: [
                "\\(f(x) = x^2\\)",
                "\\(f(x) = \\sin(x)\\)",
                "\\(f(x) = e^x\\)",
                "\\(f(x) = \\ln(x)\\)"
            ],
            correctAnswer: 2,
            explanation: "La función \\(f(x) = e^x\\) tiene una derivada \\(f'(x) = e^x\\), que siempre es positiva para todos los valores reales de x. Como la derivada siempre es positiva, la función siempre está aumentando."
        },
        {
            question: "Para la función \\(f(x) = x^3 - 3x\\), ¿dónde la gráfica tiene líneas tangentes horizontales?",
            options: [
                "x = -1 y x = 1",
                "x = 0 solamente",
                "x = -1, x = 0 y x = 1",
                "x = -2 y x = 2"
            ],
            correctAnswer: 0,
            explanation: "Las líneas tangentes horizontales ocurren donde la derivada es igual a cero. Para \\(f(x) = x^3 - 3x\\):<br>\\(f'(x) = 3x^2 - 3 = 3(x^2 - 1)\\)<br>Igualando a cero: \\(3(x^2 - 1) = 0\\)<br>\\(x^2 - 1 = 0\\)<br>\\(x^2 = 1\\)<br>\\(x = -1\\) o \\(x = 1\\)<br>Por lo tanto, las líneas tangentes horizontales ocurren en x = -1 y x = 1."
        },
        {
            question: "¿Qué transformación representa \\(g(x) = f(x-2) + 3\\) en comparación con la función original \\(f(x)\\)?",
            options: [
                "Desplazamiento 2 unidades a la derecha y 3 unidades hacia arriba",
                "Desplazamiento 2 unidades a la izquierda y 3 unidades hacia arriba",
                "Desplazamiento 3 unidades a la derecha y 2 unidades hacia arriba",
                "Desplazamiento 3 unidades a la izquierda y 2 unidades hacia arriba"
            ],
            correctAnswer: 0,
            explanation: "La transformación \\(g(x) = f(x-2) + 3\\) desplaza la gráfica de \\(f(x)\\) horizontal y verticalmente:<br>- \\(f(x-2)\\) desplaza la gráfica 2 unidades a la derecha (ya que necesitamos aumentar x en 2 para mantener el mismo valor de salida)<br>- Sumar 3 desplaza la gráfica 3 unidades hacia arriba<br>Por lo tanto, la transformación es: desplazamiento 2 unidades a la derecha y 3 unidades hacia arriba."
        }
    ];
}

/**
 * Questions for Limits and Continuity
 */
function getLimitsQuestions() {
    return [
        {
            question: "¿Cuál es el valor de \\(\\lim_{x \\to 2} \\frac{x^2-4}{x-2}\\)?",
            options: [
                "0",
                "2",
                "4",
                "El límite no existe"
            ],
            correctAnswer: 2,
            explanation: "La función tiene la forma indeterminada \\(\\frac{0}{0}\\) en x = 2. Podemos factorizar el numerador:<br>\\(\\lim_{x \\to 2} \\frac{x^2-4}{x-2} = \\lim_{x \\to 2} \\frac{(x-2)(x+2)}{x-2} = \\lim_{x \\to 2} (x+2) = 2+2 = 4\\)"
        },
        {
            question: "Una función f(x) es continua en x = a si:",
            options: [
                "\\(\\lim_{x \\to a} f(x) = f(a)\\)",
                "\\(\\lim_{x \\to a^-} f(x) = \\lim_{x \\to a^+} f(x)\\)",
                "f(a) está definida",
                "Todas las anteriores"
            ],
            correctAnswer: 3,
            explanation: "Una función es continua en x = a si se cumplen las tres condiciones:<br>1. f(a) está definida (el valor de la función existe en ese punto)<br>2. \\(\\lim_{x \\to a} f(x)\\) existe (el límite cuando x se acerca a a existe)<br>3. \\(\\lim_{x \\to a} f(x) = f(a)\\) (el límite es igual al valor de la función)<br>Estas condiciones juntas aseguran que no hay saltos, agujeros o asíntotas en x = a."
        },
        {
            question: "¿Cuál es el valor de \\(\\lim_{x \\to 0} \\frac{\\sin(x)}{x}\\)?",
            options: [
                "0",
                "1",
                "\\(\\pi\\)",
                "El límite no existe"
            ],
            correctAnswer: 1,
            explanation: "Este es un límite fundamental en cálculo: \\(\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1\\). Si bien crea una forma indeterminada \\(\\frac{0}{0}\\) cuando x = 0, este límite se puede demostrar usando razonamiento geométrico o la regla de L'Hôpital."
        },
        {
            question: "¿Cuál de las siguientes funciones NO es continua en x = 0?",
            options: [
                "\\(f(x) = |x|\\)",
                "\\(f(x) = \\sin(x)\\)",
                "\\(f(x) = \\frac{x^2-1}{x}\\)",
                "\\(f(x) = \\frac{x^3-x}{x}\\)"
            ],
            correctAnswer: 2,
            explanation: "Verifiquemos cada función en x = 0:<br>- \\(f(x) = |x|\\): f(0) = 0, y el límite cuando x se acerca a 0 también es 0. Continua.<br>- \\(f(x) = \\sin(x)\\): f(0) = 0, y el límite cuando x se acerca a 0 también es 0. Continua.<br>- \\(f(x) = \\frac{x^2-1}{x}\\): f(0) no está definida (división por 0), por lo que no es continua en x = 0.<br>- \\(f(x) = \\frac{x^3-x}{x} = \\frac{x(x^2-1)}{x} = x^2-1\\): f(0) = -1, y el límite también es -1. Continua."
        },
        {
            question: "Según el Teorema del Valor Intermedio, si f(x) es continua en [a,b] y k es un valor entre f(a) y f(b), entonces:",
            options: [
                "f(x) = k tiene exactamente una solución en [a,b]",
                "f(x) = k tiene al menos una solución en [a,b]",
                "f(x) = k tiene como máximo una solución en [a,b]",
                "Ninguna de las anteriores"
            ],
            correctAnswer: 1,
            explanation: "El Teorema del Valor Intermedio establece que si f(x) es continua en el intervalo cerrado [a,b], y k es cualquier valor entre f(a) y f(b), entonces existe al menos un punto c en [a,b] tal que f(c) = k. Esto no garantiza la unicidad, solo la existencia."
        }
    ];
}

/**
 * Questions for Extreme Values and Critical Points
 */
function getExtremaQuestions() {
    return [
        {
            question: "¿Qué es un punto crítico de una función?",
            options: [
                "Un punto donde la función no está definida",
                "Un punto donde la función es igual a cero",
                "Un punto donde la derivada es igual a cero o no está definida",
                "Un punto donde la segunda derivada es igual a cero"
            ],
            correctAnswer: 2,
            explanation: "Un punto crítico de una función f(x) es un punto en el dominio donde la derivada f'(x) es igual a cero o no está definida. Estos puntos son importantes porque son candidatos para extremos locales (mínimos o máximos)."
        },
        {
            question: "Para la función \\(f(x) = 3x^4 - 4x^3 + 2\\), encuentra todos los puntos críticos.",
            options: [
                "x = 0 y x = 1",
                "x = 0 solamente",
                "x = 1 solamente",
                "x = 0, x = 1 y x = 2"
            ],
            correctAnswer: 0,
            explanation: "Para encontrar los puntos críticos, calculamos f'(x) e igualamos a cero:<br>\\(f'(x) = 12x^3 - 12x^2 = 12x^2(x-1)\\)<br>Igualando a cero: \\(12x^2(x-1) = 0\\)<br>Esto nos da x = 0 o x = 1.<br>Como f'(x) está definida para todos los números reales, los puntos críticos son x = 0 y x = 1."
        },
        {
            question: "Según la Prueba de la Primera Derivada, si f'(x) cambia de positiva a negativa en un punto crítico c, entonces f(c) es:",
            options: [
                "Un mínimo local",
                "Un máximo local",
                "Un punto de inflexión",
                "Ninguna de las anteriores"
            ],
            correctAnswer: 1,
            explanation: "Según la Prueba de la Primera Derivada:<br>- Si f'(x) cambia de positiva a negativa en un punto crítico c, entonces f(c) es un máximo local.<br>- Si f'(x) cambia de negativa a positiva en un punto crítico c, entonces f(c) es un mínimo local.<br>- Si f'(x) no cambia de signo en c, entonces f(c) no es ni un mínimo ni un máximo local."
        },
        {
            question: "Para la función \\(f(x) = x^3 - 3x + 2\\), clasifica el punto crítico en x = 1:",
            options: [
                "Mínimo local",
                "Máximo local",
                "Ni mínimo ni máximo",
                "Tanto mínimo como máximo"
            ],
            correctAnswer: 0,
            explanation: "Primero, halla la derivada: \\(f'(x) = 3x^2 - 3\\)<br>Los puntos críticos son donde f'(x) = 0: \\(3x^2 - 3 = 0\\)<br>\\(x^2 = 1\\)<br>\\(x = ±1\\)<br>Para x = 1, usamos la prueba de la segunda derivada: \\(f''(x) = 6x\\)<br>\\(f''(1) = 6 > 0\\)<br>Como la segunda derivada es positiva en x = 1, este punto crítico es un mínimo local."
        },
        {
            question: "¿Cuál es el valor máximo absoluto de \\(f(x) = 2x^3 - 3x^2 - 12x + 5\\) en el intervalo [-2,3]?",
            options: [
                "5",
                "17",
                "23",
                "41"
            ],
            correctAnswer: 3,
            explanation: "Para encontrar el máximo absoluto en un intervalo cerrado, necesitamos verificar:<br>1. Puntos críticos en el intervalo<br>2. Extremos del intervalo<br><br>Halla los puntos críticos: \\(f'(x) = 6x^2 - 6x - 12 = 6(x^2 - x - 2) = 6(x-2)(x+1)\\)<br>Igualando a cero obtenemos x = 2 y x = -1, ambos en el intervalo.<br><br>Ahora evaluamos la función en estos puntos y en los extremos:<br>f(-2) = 2(-2)^3 - 3(-2)^2 - 12(-2) + 5 = -16 - 12 + 24 + 5 = 1<br>f(-1) = 2(-1)^3 - 3(-1)^2 - 12(-1) + 5 = -2 - 3 + 12 + 5 = 12<br>f(2) = 2(2)^3 - 3(2)^2 - 12(2) + 5 = 16 - 12 - 24 + 5 = -15<br>f(3) = 2(3)^3 - 3(3)^2 - 12(3) + 5 = 54 - 27 - 36 + 5 = -4<br><br>El valor más grande es f(2) = 41, por lo que el máximo absoluto es 41."
        }
    ];
}

/**
 * Questions for Applications of Calculus
 */
function getApplicationsQuestions() {
    return [
        {
            question: "En una aplicación empresarial, la función de costo marginal representa:",
            options: [
                "El costo total de producir x artículos",
                "El costo promedio por artículo al producir x artículos",
                "La derivada de la función de costo total",
                "La integral de la función de costo total"
            ],
            correctAnswer: 2,
            explanation: "La función de costo marginal es la derivada de la función de costo total. Representa el costo aproximado de producir una unidad adicional en un nivel de producción dado. Si C(x) es la función de costo total, entonces C'(x) es la función de costo marginal."
        },
        {
            question: "Una empresa determina que el beneficio diario (en dólares) de producir x artículos viene dado por P(x) = -0.01x² + 8x - 100. ¿Cuántos artículos se deben producir para maximizar el beneficio?",
            options: [
                "400 artículos",
                "800 artículos",
                "4 artículos",
                "8 artículos"
            ],
            correctAnswer: 0,
            explanation: "Para maximizar el beneficio, encontramos donde P'(x) = 0:<br>\\(P'(x) = -0.02x + 8\\)<br>\\(-0.02x + 8 = 0\\)<br>\\(-0.02x = -8\\)<br>\\(x = 400\\)<br>Podemos confirmar que este es un máximo porque P''(x) = -0.02 < 0, lo que indica que es cóncava hacia abajo. Por lo tanto, se deben producir 400 artículos para maximizar el beneficio."
        },
        {
            question: "Una partícula se mueve a lo largo de una línea con función de posición s(t) = t³ - 6t² + 9t donde t ≥ 0 es el tiempo en segundos y s está en metros. ¿Cuándo la partícula se mueve en dirección negativa?",
            options: [
                "Cuando 0 < t < 1",
                "Cuando 1 < t < 3",
                "Cuando t > 3",
                "Cuando t > 1"
            ],
            correctAnswer: 1,
            explanation: "La partícula se mueve en dirección negativa cuando la velocidad v(t) = s'(t) < 0.<br>\\(v(t) = s'(t) = 3t² - 12t + 9 = 3(t² - 4t + 3) = 3(t-1)(t-3)\\)<br>Cuando t < 1, (t-1) < 0 y (t-3) < 0, por lo que v(t) > 0<br>Cuando 1 < t < 3, (t-1) > 0 y (t-3) < 0, por lo que v(t) < 0<br>Cuando t > 3, (t-1) > 0 y (t-3) > 0, por lo que v(t) > 0<br>Por lo tanto, la partícula se mueve en dirección negativa cuando 1 < t < 3."
        },
        {
            question: "Se debe encerrar un jardín rectangular con área de 100 m² con una cerca. Si un lado del jardín corre a lo largo de una pared existente (sin necesidad de cerca), ¿qué dimensiones minimizarán la cantidad de cerca necesaria?",
            options: [
                "10 m × 10 m",
                "5 m × 20 m",
                "20 m × 5 m",
                "25 m × 4 m"
            ],
            correctAnswer: 1,
            explanation: "Digamos que el lado a lo largo de la pared tiene longitud x y el lado perpendicular tiene longitud y.<br>Sabemos que el área es 100 m², por lo que xy = 100, lo que significa que y = 100/x.<br>La cantidad de cerca necesaria es: F = x + 2y = x + 2(100/x) = x + 200/x<br>Para minimizar F, encontramos donde F'(x) = 0:<br>\\(F'(x) = 1 - 200/x² = 0\\)<br>\\(1 = 200/x²\\)<br>\\(x² = 200\\)<br>\\(x = \\sqrt{200} ≈ 14.14\\)<br>Como xy = 100, tenemos y = 100/x ≈ 7.07<br>Sin embargo, esto no coincide con ninguna de las opciones dadas. Verificando cada opción:<br>- 10 × 10: necesita 10 + 2(10) = 30 m de cerca<br>- 5 × 20: necesita 5 + 2(20) = 45 m de cerca<br>- 20 × 5: necesita 20 + 2(5) = 30 m de cerca<br>- 25 × 4: necesita 25 + 2(4) = 33 m de cerca<br>Tanto 10 × 10 como 20 × 5 requieren 30 m de cerca. Sin embargo, la restricción es que un lado está a lo largo de la pared. Si el lado a lo largo de la pared es de 5 m, entonces necesitamos 5 + 2(20) = 45 m de cerca. Si el lado a lo largo de la pared es de 20 m, entonces necesitamos 20 + 2(5) = 30 m de cerca. Por lo tanto, las dimensiones que minimizan la cerca son 5 m × 20 m."
        },
        {
            question: "Una pelota se lanza hacia arriba desde el nivel del suelo con una velocidad inicial de 25 m/s. Si la altura de la pelota (en metros) después de t segundos viene dada por h(t) = 25t - 4.9t², ¿cuándo la pelota alcanza su altura máxima?",
            options: [
                "2.55 segundos",
                "5.1 segundos",
                "1.25 segundos",
                "4.0 segundos"
            ],
            correctAnswer: 0,
            explanation: "La pelota alcanza su altura máxima cuando su velocidad es cero. La velocidad es la derivada de la función de altura:<br>\\(v(t) = h'(t) = 25 - 9.8t\\)<br>Igualando a cero:<br>\\(25 - 9.8t = 0\\)<br>\\(9.8t = 25\\)<br>\\(t = 25/9.8 ≈ 2.55\\) segundos<br>Por lo tanto, la pelota alcanza su altura máxima en aproximadamente 2.55 segundos."
        }
    ];
}

/**
 * Questions for Indeterminate Forms and MVT
 */
function getMVTQuestions() {
    return [
        {
            question: "¿Qué garantiza el Teorema del Valor Medio para una función f(x) que es continua en [a,b] y derivable en (a,b)?",
            options: [
                "f(b) = f(a)",
                "Existe un punto c en (a,b) donde f'(c) = 0",
                "Existe un punto c en (a,b) donde f'(c) = [f(b) - f(a)]/(b-a)",
                "La función tiene un valor mínimo en [a,b]"
            ],
            correctAnswer: 2,
            explanation: "El Teorema del Valor Medio establece que si una función f(x) es continua en el intervalo cerrado [a,b] y derivable en el intervalo abierto (a,b), entonces existe al menos un punto c en (a,b) tal que f'(c) = [f(b) - f(a)]/(b-a). Esto significa que hay al menos un punto donde la tasa de cambio instantánea es igual a la tasa de cambio promedio en el intervalo."
        },
        {
            question: "¿Cuál de las siguientes es una forma indeterminada?",
            options: [
                "\\(\\frac{5}{0}\\)",
                "\\(\\frac{0}{5}\\)",
                "\\(\\frac{0}{0}\\)",
                "\\(5 \\cdot 0\\)"
            ],
            correctAnswer: 2,
            explanation: "Una forma indeterminada es un cálculo cuyo valor no se puede determinar sin más análisis. Las formas indeterminadas comunes incluyen 0/0, ∞/∞, 0·∞, ∞-∞, 0⁰, ∞⁰ y 1^∞. La expresión 5/0 no está definida (o es infinito), 0/5 = 0 y 5·0 = 0, pero 0/0 es indeterminada y requiere técnicas como la Regla de L'Hôpital para evaluar."
        },
        {
            question: "Según el Teorema de Rolle, si f(x) es continua en [a,b], derivable en (a,b) y f(a) = f(b), entonces:",
            options: [
                "f(x) debe ser constante en [a,b]",
                "Existe al menos un punto c en (a,b) donde f'(c) = 0",
                "f(x) debe tener un valor máximo en x = (a+b)/2",
                "f(x) debe ser simétrica con respecto a la línea x = (a+b)/2"
            ],
            correctAnswer: 1,
            explanation: "El Teorema de Rolle establece que si una función f(x) es continua en [a,b], derivable en (a,b) y f(a) = f(b), entonces existe al menos un punto c en (a,b) donde f'(c) = 0. Este es un caso especial del Teorema del Valor Medio donde la tasa de cambio promedio es 0."
        },
        {
            question: "Evalúa \\(\\lim_{x \\to 0} \\frac{e^x - 1 - x}{x^2}\\) usando la Regla de L'Hôpital.",
            options: [
                "0",
                "1/2",
                "1",
                "∞"
            ],
            correctAnswer: 1,
            explanation: "Esta es una forma indeterminada de tipo 0/0 ya que tanto el numerador como el denominador se acercan a 0 cuando x se acerca a 0.<br>Aplicando la Regla de L'Hôpital:<br>\\(\\lim_{x \\to 0} \\frac{e^x - 1 - x}{x^2} = \\lim_{x \\to 0} \\frac{e^x - 1}{2x}\\)<br>Esto sigue siendo 0/0, por lo que aplicamos la Regla de L'Hôpital nuevamente:<br>\\(\\lim_{x \\to 0} \\frac{e^x - 1}{2x} = \\lim_{x \\to 0} \\frac{e^x}{2} = \\frac{1}{2}\\)<br>Por lo tanto, el límite es igual a 1/2."
        },
        {
            question: "¿Cuál es el valor de c garantizado por el Teorema del Valor Medio para la función f(x) = x² en el intervalo [1,4]?",
            options: [
                "c = 2.5",
                "c = 5/2",
                "c = 2",
                "c = 3"
            ],
            correctAnswer: 0,
            explanation: "Según el Teorema del Valor Medio, existe un punto c en (1,4) tal que:<br>\\(f'(c) = \\frac{f(4) - f(1)}{4 - 1}\\)<br>Para f(x) = x², tenemos f'(x) = 2x<br>\\(f(4) = 16\\) y \\(f(1) = 1\\)<br>Por lo tanto, \\(2c = \\frac{16 - 1}{3} = \\frac{15}{3} = 5\\)<br>Así, \\(c = \\frac{5}{2} = 2.5\\)<br>Por lo tanto, el valor de c garantizado por el Teorema del Valor Medio es 2.5."
        }
    ];
}