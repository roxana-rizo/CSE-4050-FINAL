// backend/routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const quizController = require('../../controller/quiz.Controller');

router.get('/questions', quizController.getQuestions);
router.post('/results', quizController.submitScore);

module.exports = router;
