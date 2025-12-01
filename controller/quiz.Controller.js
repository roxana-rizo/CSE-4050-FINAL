// backend > controllers > quizController.js
const db = require('../backend/db');

// GET /api/quiz/questions
exports.getQuestions = (req, res) => {
  const sql = `
    SELECT numb, question, answer,
    option1, option2, option3, option4
    FROM questions
    ORDER BY RAND()
    LIMIT 5
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    const formatted = results.map(q => ({
      numb: q.numb,
      question: q.question,
      answer: q.answer,
      options: [q.option1, q.option2, q.option3, q.option4]
    }));

    res.json({ success: true, questions: formatted });
  });
};

// POST /api/quiz/results
exports.submitScore = (req, res) => {
  const { username = null, score, totalQuestions } = req.body;

  const sql = `
    INSERT INTO results (username, score, totalQuestions)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [username, score, totalQuestions], (err) => {
    if (err) {
      console.error("Error saving score:", err);
      return res.status(500).json({ success: false, message: "Could not save result" });
    }

    res.json({ success: true, message: "Score saved!" });
  });
};
