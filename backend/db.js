// backend > config > db.js
const mysql = require('mysql');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'PASSWORD_OF_USER', // Here we paste the paswword of who ever runs their MySQL Account
  database: 'quizdb',
  connectionLimit: 10
});

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
  } else {
    console.log("✅ MySQL Connected!");
    connection.release();
  }
});

module.exports = db;
