const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret'; 

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');

  db.query('CREATE DATABASE IF NOT EXISTS calculator_db', (err) => {
    if (err) throw err;
    console.log('Database created or already exists');

   
    db.query('USE calculator_db', (err) => {
      if (err) throw err;
      console.log('Using database calculator_db');

    
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user'
        )
      `;
      db.query(createUsersTable, (err) => {
        if (err) throw err;
        console.log('Users table created or already exists');

        
        db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT \'user\'', (err) => {
          if (err && !err.message.includes('Duplicate column')) throw err;
          console.log('Role column added or already exists');

         
          const createHistoryTable = `
            CREATE TABLE IF NOT EXISTS calculation_history (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              operation VARCHAR(255) NOT NULL,
              result VARCHAR(255) NOT NULL,
              FOREIGN KEY (user_id) REFERENCES users(id)
            )
          `;
          db.query(createHistoryTable, (err) => {
            if (err) throw err;
            console.log('Calculation history table created or already exists');

           
            app.listen(PORT, () => {
              console.log(`Server running on http://localhost:${PORT}`);
            });
          });
        });
      });
    });
  });
});

// Routes
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role || 'user'], (err) => {
    if (err) return res.status(400).json({ error: 'User already exists' });
    res.json({ message: 'User registered' });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
    const user = results[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token });
  });
});

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

app.post('/save-history', authenticateToken, (req, res) => {
  const { operation, result } = req.body;
  db.query('INSERT INTO calculation_history (user_id, operation, result) VALUES (?, ?, ?)', [req.user.id, operation, result], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to save history' });
    res.json({ message: 'History saved' });
  });
});

app.get('/get-history', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    db.query('SELECT u.username, ch.operation, ch.result FROM calculation_history ch JOIN users u ON ch.user_id = u.id ORDER BY ch.id DESC', (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to retrieve history' });
      res.json({ history: results });
    });
  } else {
    db.query('SELECT operation, result FROM calculation_history WHERE user_id = ? ORDER BY id DESC', [req.user.id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to retrieve history' });
      res.json({ history: results });
    });
  }
});
