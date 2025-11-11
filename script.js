// Redirect if we skipped login
if (!localStorage.getItem("quizUser")) {
  window.location.href = "login.html";
}

// Show username
const usernameDisplay = document.getElementById("usernameDisplay");
const username = localStorage.getItem("quizUser");
usernameDisplay.textContent = `User Name: ${username}`;

// Logout function
function logout() {
  localStorage.removeItem("quizUser");
  window.location.href = "login.html";
}

//  Quiz questions and answers
const quizData = [
  {question: "What is the capital of France?", options: ["Paris", "London", "Berlin", "Madrid"], answer: "Paris"},
  {question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: "Mars"},
  {question: "What is 5 + 3?", options: ["5", "8", "9", "7"], answer: "8"},
  {question: "Which is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: "Pacific"},
  {question: "Who wrote 'Romeo and Juliet'?", options: ["Shakespeare", "Hemingway", "Dickens", "Austen"], answer: "Shakespeare"},
  {question: "What gas do plants absorb?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], answer: "Carbon Dioxide"},
  {question: "Which country invented pizza?", options: ["USA", "France", "Italy", "Greece"], answer: "Italy"},
  {question: "What is the largest mammal?", options: ["Elephant", "Blue Whale", "Giraffe", "Shark"], answer: "Blue Whale"},
  {question: "What is the boiling point of water (°C)?", options: ["90", "80", "100", "120"], answer: "100"},
  {question: "Which language is used for web apps?", options: ["Python", "JavaScript", "C++", "Swift"], answer: "JavaScript"},
  {question: "What superhero can fly?", options: ["Spiderman", "Silversurfer", "Superman", "Hulk"], answer: "Superman"},
];

// This feature Track our answers
let userAnswers = [];

let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");

//  Loads our next question
function loadQuestion() {
  const q = quizData[currentQuestion];

  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";

  q.options.forEach(opt => {
    const li = document.createElement("li");
    li.innerHTML =
      `<label><input type="radio" name="option" value="${opt}"> ${opt}</label>`;
    optionsEl.appendChild(li);
  });
}

//  Next button 
nextBtn.addEventListener("click", () => {
  const selected = document.querySelector("input[name='option']:checked");

  if (!selected) {
    alert("Please select an option!");
    return;
  }

  // Saves our answer
  userAnswers.push({
    question: quizData[currentQuestion].question,
    selected: selected.value,
    correct: quizData[currentQuestion].answer
  });

  if (selected.value === quizData[currentQuestion].answer) {
    score++;
  }

  currentQuestion++;

  if (currentQuestion < quizData.length) {
    loadQuestion();
  } else {
    showResults();
  }
});

// Display sfinal summary
function showResults() {

  document.querySelector(".quiz-container").innerHTML = `
    <h2>Quiz Completed!</h2>
    <p class="result">Your Score: ${score} / ${quizData.length}</p>
    <h3>Question Review</h3>

    <div id="summary"></div>

    <button onclick="location.reload()">Restart Quiz</button>
    <button class="logout-btn" onclick="logout()">Logout</button>
  `;

  const summaryBox = document.getElementById("summary");
  summaryBox.innerHTML = "";

  userAnswers.forEach((item, index) => {
    const isCorrect = item.selected === item.correct;

    const div = document.createElement("div");
    div.className = "summary-item";

    div.innerHTML = `
      <p><strong>${index + 1}. ${item.question}</strong></p>
      <p>Your answer: <span class="${isCorrect ? 'correct' : 'wrong'}">${item.selected}</span></p>
      <p>Correct answer: <span class="correct">${item.correct}</span></p>
    `;

    summaryBox.appendChild(div);
  });
}

// Starts the quiz
loadQuestion();
