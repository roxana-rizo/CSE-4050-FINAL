// backend > src > index.js
const express = require('express');
const cors = require('cors');

const quizRoutes = require('../routes/quizRoutes');
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use('/api/quiz', quizRoutes);
app.use('/api/auth', authRoutes);

// TEST ROOT
app.get('/', (req, res) => {
    res.send('✔ Quiz backend is running');
});

// SERVER START
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log('===========================================');
    console.log('   🚀 QUIZ BACKEND SERVER STARTED');
    console.log('===========================================');
    console.log(`Local URL:   http://localhost:${PORT}`);
    console.log(`Test quizzes: http://localhost:${PORT}/api/quiz/questions`);
    console.log(`Test login:   http://localhost:${PORT}/api/auth/login`);
    console.log('===========================================');
});
