// backend > controllers > authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// POST /api/auth/register
exports.register = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || username.trim() === '') {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  const checkSql = 'SELECT id FROM users WHERE username = ?';
  db.query(checkSql, [username], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });

    if (rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }

    const hashed = bcrypt.hashSync(password, 10);

    const insertSql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(insertSql, [username, hashed], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: 'Could not register user' });

      return res.json({ success: true, message: 'Registration successful!' });
    });
  });
};

// POST /api/auth/login
exports.login = (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = rows[0];

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    return res.json({
      success: true,
      message: 'Login successful!',
      username: user.username
    });
  });
};
