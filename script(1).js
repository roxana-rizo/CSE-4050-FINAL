// ===============================
// GLOBAL ELEMENTS
// ===============================
const startBtn = document.querySelector('.start-btn');
const popupInfo = document.querySelector('.popup-info');
const exitBtn = document.querySelector('.exit-btn');
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

// ===============================
// LOAD QUESTIONS FROM BACKEND
// ===============================
async function loadQuestions() {
    try {
        const response = await fetch("http://localhost:5001/api/quiz/questions");
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error();
        }

        // Convert backend field names -> local question.js style
        quizData = data.map((q, index) => ({
            numb: index + 1,
            question: q.question,
            answer: q.correct_answer,
            options: [q.option1, q.option2, q.option3, q.option4]
        }));

        console.log("✅ Using BACKEND questions");
    } catch (err) {
        console.warn("⚠ Backend offline — using LOCAL questions.js array");
        quizData = questions; // <-- your local question.js array
    }
}

// load questions immediately
loadQuestions();

// ===============================
// BUTTON HANDLERS
// ===============================
startBtn.onclick = () => {
    popupInfo.classList.add('active');
    main.classList.add('active');
};

exitBtn.onclick = () => {
    popupInfo.classList.remove('active');
    main.classList.remove('active');
};

continueBtn.onclick = () => {
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
function animateCircle() {
    const circularProgress = document.querySelector('.circular-progress');
    const progressValue = document.querySelector('.progress-value');

    let progressStartValue = -1;
    let progressEndValue = (userScore / quizData.length) * 100;
    let speed = 20;

    let progress = setInterval(() => {
        progressStartValue++;
        progressValue.textContent = `${progressStartValue}%`;
        circularProgress.style.background =
            `conic-gradient(#AA2C86 ${progressStartValue * 3.6}deg, rgba(255,255,255,.1) 0deg)`;

        if (progressStartValue == progressEndValue) {
            clearInterval(progress);
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
