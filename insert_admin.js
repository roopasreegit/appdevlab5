const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');

  db.query('USE calculator_db', (err) => {
    if (err) throw err;

    bcrypt.hash('admin123', 10, (err, hashedPassword) => {
      if (err) throw err;

      db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin'], (err) => {
        if (err) {
          console.log('Admin user already exists or error:', err.message);
        } else {
          console.log('Admin user created: username=admin, password=admin123');
        }
        db.end();
      });
    });
  });
});
