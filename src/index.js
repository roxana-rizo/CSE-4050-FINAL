// backend/src/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const quizRoutes = require('../backend/routes/quizRoutes');
const authRoutes = require('../backend/routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Serve the frontend folder
const frontendPath = path.join(__dirname, '../frontend');
console.log('Serving static files from:', frontendPath);
app.use(express.static(frontendPath));

// ROUTES
app.use('/api/quiz', quizRoutes);
app.use('/api/auth', authRoutes);

// TEST ROOT
app.get('/', (req, res) => {
    res.send('✔ Quiz backend is running');
});

// SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('===========================================');
    console.log('   🚀 QUIZ BACKEND SERVER STARTED');
    console.log('===========================================');
    console.log(`Frontend URL: http://localhost:${PORT}/login.html`);
    console.log(`Quiz page:    http://localhost:${PORT}/index(2).html`);
    console.log(`API quizzes:  http://localhost:${PORT}/api/quiz/questions`);
    console.log(`API login:    http://localhost:${PORT}/api/auth/login`);
    console.log('===========================================');
});
