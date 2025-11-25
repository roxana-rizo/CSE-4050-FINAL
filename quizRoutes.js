// backend/routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.get('/questions', quizController.getQuestions);
router.post('/results', quizController.submitScore);

module.exports = router;
