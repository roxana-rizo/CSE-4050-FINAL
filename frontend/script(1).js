// ===============================
// GLOBAL ELEMENTS
// ===============================
// collect all start/create buttons from the home quiz cards
const startBtns = document.querySelectorAll('.start-btn');
const popupInfo = document.querySelector('.popup-info');
const exitBtn = document.querySelector('.exit-btn');
const exitQuizBtn = document.querySelector('.exit-quiz-btn');
const main = document.querySelector('.main');
const continueBtn = document.querySelector('.continue-btn');
const quizSection = document.querySelector('.quiz-section');
const quizBox = document.querySelector('.quiz-box');
const resultBox = document.querySelector('.result-box');
const tryAgainBtn = document.querySelector('.tryAgain-btn');
const goHomeBtn = document.querySelector('.goHome-btn');

const nextBtn = document.querySelector('.next-btn');
const optionList = document.querySelector('.option-list');

// ===============================
// GLOBAL QUIZ STATE
// ===============================
let quizData = [];     // this will be backend OR local
let questionCount = 0;
let questionNumb = 1;
let userScore = 0;
let selectedQuiz = null; // topic selected from home cards

// ===============================
// LOAD QUESTIONS FROM BACKEND
// ===============================
async function loadQuestions(topic = null) {
    const baseUrl = "http://localhost:5001/api/quiz/questions";
    const url = topic ? `${baseUrl}?topic=${encodeURIComponent(topic)}` : baseUrl;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error();
        }

        // Convert backend field names -> local question.js style
        quizData = data.map((q, index) => ({
            numb: index + 1,
            question: q.question,
            answer: q.correct_answer || q.answer,
            options: q.options || [q.option1, q.option2, q.option3, q.option4]
        }));

        console.log("✅ Using BACKEND questions (topic:", topic, ")");
    } catch (err) {
        console.warn("⚠ Backend offline or no data for topic — using LOCAL questions array");

        // Fallback: use local topic-specific question arrays
        if (topic) {
            const t = topic.toLowerCase();
            const topicMap = {
                html: typeof questions !== 'undefined' ? questions : [],
                geography: typeof geographyQuestions !== 'undefined' ? geographyQuestions : [],
                history: typeof historyQuestions !== 'undefined' ? historyQuestions : [],
                biology: typeof biologyQuestions !== 'undefined' ? biologyQuestions : [],
                math: typeof mathQuestions !== 'undefined' ? mathQuestions : []
            };

            quizData = topicMap[t] || questions || [];
        } else {
            quizData = questions || [];
        }
    }

    // normalize numbering
    quizData = quizData.map((q, i) => ({ ...q, numb: i + 1 }));
}

// load default general questions immediately (no topic)
loadQuestions();

// ===============================
// BUTTON HANDLERS
// ===============================
// Home start buttons (multiple)
startBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const quiz = e.currentTarget.dataset.quiz;

        if (quiz === 'create') {
            // Open the quiz creation modal instead of prompts
            openQuizCreationModal();
            return;
        }

        // immediate start for selected topic (no guide popup)
        await startSelectedQuiz(quiz);
    });
});

// helper: load topic questions and start the quiz immediately (bypass guide)
async function startSelectedQuiz(topic) {
    selectedQuiz = topic;

    if (topic !== 'custom') {
        await loadQuestions(topic);
    }

    if (!quizData || quizData.length === 0) {
        alert('⚠ Could not load questions for this topic.');
        return;
    }

    // Update quiz title with the selected topic
    const quizBoxTitle = document.querySelector('.quiz-box h1');
    if (quizBoxTitle) {
        // Capitalize first letter of topic
        const displayTitle = topic.charAt(0).toUpperCase() + topic.slice(1) + ' Quiz';
        quizBoxTitle.textContent = displayTitle;
    }

    // open quiz view
    quizSection.classList.add('active');
    popupInfo.classList.remove('active');
    main.classList.remove('active');
    quizBox.classList.add('active');

    showQuestions(0);
    questionCounter(1);
    headerScore();
}

exitBtn.onclick = () => {
    popupInfo.classList.remove('active');
    main.classList.remove('active');
};

continueBtn.onclick = async () => {
    // ensure a quiz/topic was selected
    if (!selectedQuiz) {
        alert('Please select a quiz from the home screen first.');
        return;
    }

    // if user created a custom quiz earlier, quizData is already set
    if (selectedQuiz !== 'custom') {
        await loadQuestions(selectedQuiz);
    }

    if (quizData.length === 0) {
        alert("⚠ Could not load questions! Check backend or questions.js");
        return;
    }

    quizSection.classList.add('active');
    popupInfo.classList.remove('active');
    main.classList.remove('active');
    quizBox.classList.add('active');

    showQuestions(0);
    questionCounter(1);
    headerScore();
};

tryAgainBtn.onclick = () => {
    resetQuiz();
};

goHomeBtn.onclick = () => {
    resetQuiz();
    quizSection.classList.remove('active');
};

exitQuizBtn.onclick = () => {
    quizSection.classList.remove('active');
};

// ===============================
// RESET QUIZ
// ===============================
function resetQuiz() {
    quizBox.classList.add('active');
    resultBox.classList.remove('active');
    nextBtn.classList.remove('active');

    questionCount = 0;
    questionNumb = 1;
    userScore = 0;

    showQuestions(questionCount);
    questionCounter(questionNumb);
    headerScore();
}

// ===============================
// NEXT BUTTON LOGIC
// ===============================
nextBtn.onclick = () => {
    if (questionCount < quizData.length - 1) {
        questionCount++;
        questionNumb++;

        showQuestions(questionCount);
        questionCounter(questionNumb);
        nextBtn.classList.remove('active');
    } else {
        showResultBox();
        saveScore();
    }
};

// ===============================
// RENDER QUESTIONS
// ===============================
function showQuestions(index) {
    const q = quizData[index];

    const questionText = document.querySelector('.question-text');
    questionText.textContent = `${q.numb}. ${q.question}`;

    let optionTag = `
        <div class="option"><span>${q.options[0]}</span></div>
        <div class="option"><span>${q.options[1]}</span></div>
        <div class="option"><span>${q.options[2]}</span></div>
        <div class="option"><span>${q.options[3]}</span></div>
    `;

    optionList.innerHTML = optionTag;

    const option = document.querySelectorAll('.option');
    option.forEach(opt => {
        opt.onclick = () => optionSelected(opt);
    });
}

// ===============================
// OPTION SELECTED
// ===============================
function optionSelected(answer) {
    let userAnswer = answer.textContent;
    let correctAnswer = quizData[questionCount].answer;

    let allOptions = optionList.children.length;

    if (userAnswer == correctAnswer) {
        answer.classList.add('correct');
        userScore++;
        headerScore();
    } else {
        answer.classList.add('incorrect');

        // mark the correct answer
        for (let i = 0; i < allOptions; i++) {
            if (optionList.children[i].textContent == correctAnswer) {
                optionList.children[i].classList.add('correct');
            }
        }
    }

    // disable all options
    for (let i = 0; i < allOptions; i++) {
        optionList.children[i].classList.add('disabled');
    }

    nextBtn.classList.add('active');
}

// ===============================
// HUD UPDATES
// ===============================
function questionCounter(index) {
    const questionTotal = document.querySelector('.question-total');
    questionTotal.textContent = `${index} of ${quizData.length} Questions`;
}

function headerScore() {
    const headerScoreText = document.querySelector('.header-score');
    headerScoreText.textContent = `Score: ${userScore} / ${quizData.length}`;
}

// ===============================
// RESULT BOX
// ===============================
function showResultBox() {
    quizBox.classList.remove('active');
    resultBox.classList.add('active');

    const scoreText = document.querySelector('.score-text');
    scoreText.textContent = `Your Score ${userScore} out of ${quizData.length}`;

    animateCircle();
}

// ===============================
// PROGRESS CIRCLE
// ===============================
let progressInterval = null; // Store the interval globally

function animateCircle() {
    const circularProgress = document.querySelector('.circular-progress');
    const progressValue = document.querySelector('.progress-value');

    // Clear any existing animation interval
    if (progressInterval) {
        clearInterval(progressInterval);
    }

    // Reset the circle to 0
    circularProgress.style.background = 'conic-gradient(#AA2C86 0deg, rgba(255,255,255,.1) 0deg)';
    
    let progressStartValue = 0;
    let progressEndValue = Math.round((userScore / quizData.length) * 100);
    let speed = 20;

    progressInterval = setInterval(() => {
        progressStartValue++;
        progressValue.textContent = `${progressStartValue}%`;
        circularProgress.style.background =
            `conic-gradient(#AA2C86 ${progressStartValue * 3.6}deg, rgba(255,255,255,.1) 0deg)`;

        if (progressStartValue >= progressEndValue) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    }, speed);
}

// ===============================
// SAVE SCORE TO BACKEND
// ===============================
async function saveScore() {
    try {
        await fetch("http://localhost:5001/api/quiz/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                score: userScore,
                username: localStorage.getItem("username") || null,
                user_id: localStorage.getItem("user_id") || null
            })
        });

        console.log("Score submitted to backend!");
    } catch (err) {
        console.warn("⚠ Backend offline — score NOT saved");
    }
}

// ===============================
// QUIZ CREATION MODAL
// ===============================
const quizCreationModal = document.getElementById("quizCreationModal");
const quizTitleInput = document.getElementById("quizTitle");
const questionsContainer = document.getElementById("questionsContainer");
const addQuestionBtn = document.getElementById("addQuestionBtn");
const cancelCreateBtn = document.getElementById("cancelCreateBtn");
const submitCreateBtn = document.getElementById("submitCreateBtn");
const modalCloseBtn = document.querySelector(".modal-close-btn");

let questionCount_temp = 0; // counter for dynamic question IDs

// Open modal when "Create Your Quiz" card is clicked
function openQuizCreationModal() {
    quizCreationModal.classList.add("active");
    quizTitleInput.value = "";
    questionsContainer.innerHTML = "";
    questionCount_temp = 0;
}

// Close modal
function closeQuizCreationModal() {
    quizCreationModal.classList.remove("active");
}

// Add a new question input row
function addQuestionRow() {
    questionCount_temp++;
    const questionItem = document.createElement("div");
    questionItem.className = "question-item";
    questionItem.id = `question-${questionCount_temp}`;

    questionItem.innerHTML = `
        <h4>Question ${questionCount_temp}</h4>
        <div class="form-group">
            <label>Question Text:</label>
            <input type="text" class="question-text" placeholder="Enter question..." maxlength="200">
        </div>
        <div class="option-inputs">
            <input type="text" class="option-input" placeholder="Option A" maxlength="100">
            <input type="text" class="option-input" placeholder="Option B" maxlength="100">
            <input type="text" class="option-input" placeholder="Option C" maxlength="100">
            <input type="text" class="option-input" placeholder="Option D" maxlength="100">
        </div>
        <div class="correct-answer-select">
            <label>Correct Answer:</label>
            <select class="correct-answer">
                <option value="">Select correct option</option>
                <option value="Option A">Option A</option>
                <option value="Option B">Option B</option>
                <option value="Option C">Option C</option>
                <option value="Option D">Option D</option>
            </select>
        </div>
        <button type="button" class="remove-question-btn" onclick="removeQuestion('question-${questionCount_temp}')">Remove Question</button>
    `;

    questionsContainer.appendChild(questionItem);
}

// Remove a question row
function removeQuestion(questionId) {
    const element = document.getElementById(questionId);
    if (element) {
        element.remove();
    }
}

// Collect form data and start quiz
function createAndStartQuiz() {
    const title = quizTitleInput.value.trim();
    if (!title) {
        alert("Please enter a quiz title!");
        return;
    }

    const questionRows = document.querySelectorAll(".question-item");
    if (questionRows.length === 0) {
        alert("Please add at least one question!");
        return;
    }

    // Build quiz data from form
    const customQuizData = [];
    questionRows.forEach((row, index) => {
        const questionText = row.querySelector(".question-text").value.trim();
        const options = Array.from(row.querySelectorAll(".option-input")).map(input => input.value.trim());
        const correctAnswerLabel = row.querySelector(".correct-answer").value;

        if (!questionText) {
            alert(`Question ${index + 1}: Please enter question text!`);
            return;
        }

        if (options.some(opt => !opt)) {
            alert(`Question ${index + 1}: Please fill in all options!`);
            return;
        }

        if (!correctAnswerLabel) {
            alert(`Question ${index + 1}: Please select the correct answer!`);
            return;
        }

        // Map the selected option label (Option A/B/C/D) to the actual text
        const optionIndex = parseInt(correctAnswerLabel.split(' ')[1].charCodeAt(0) - 65); // A=0, B=1, C=2, D=3
        const correctAnswer = options[optionIndex];

        customQuizData.push({
            numb: index + 1,
            question: questionText,
            answer: correctAnswer,
            options: options
        });
    });

    if (customQuizData.length === 0) return;

    // Set the global quiz data and close modal
    quizData = customQuizData;
    closeQuizCreationModal();

    // Update the quiz title
    const quizBoxTitle = document.querySelector('.quiz-box h1');
    if (quizBoxTitle) {
        quizBoxTitle.textContent = title;
    }

    // Reset quiz counters
    questionCount = 0;
    questionNumb = 1;
    userScore = 0;

    // Update header score display
    const headerScoreSpan = document.querySelector('.header-score');
    if (headerScoreSpan) {
        headerScoreSpan.textContent = `Score: 0 / ${quizData.length}`;
    }

    // Start the quiz
    quizSection.classList.add('active');
    main.classList.remove('active');
    resultBox.classList.remove('active');
    quizBox.classList.add('active');
    nextBtn.classList.remove('active');
    showQuestions(0);
    questionCounter(1);
    headerScore();
}

// Event Listeners
addQuestionBtn.addEventListener("click", addQuestionRow);
cancelCreateBtn.addEventListener("click", closeQuizCreationModal);
submitCreateBtn.addEventListener("click", createAndStartQuiz);
modalCloseBtn.addEventListener("click", closeQuizCreationModal);

// Close modal when clicking outside (on backdrop)
quizCreationModal.addEventListener("click", (e) => {
    if (e.target === quizCreationModal) {
        closeQuizCreationModal();
    }
});

// Intercept the "Create Your Quiz" card click
const createQuizCard = document.querySelector('[data-quiz="create"]');
if (createQuizCard) {
    createQuizCard.addEventListener("click", (e) => {
        e.preventDefault();
        openQuizCreationModal();
    });
}
