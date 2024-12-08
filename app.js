const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, password TEXT, is_admin INTEGER)");
  bcrypt.hash('admin_password', 10, (err, hash) => {
    db.run("INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)", ['admin@ctfchallenge.com', hash, 1]);
  });
});

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'chennavaramgowtham1234@gmail.com',
    pass: 'zngr chlv ymlb lbno'
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    db.run("INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)", [email, hash, 0], (err) => {
      if (err) {
        res.status(500).json({ error: 'Error creating user' });
      } else {
        res.json({ message: 'User created successfully' });
      }
    });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) {
      res.status(401).json({ error: 'Invalid credentials' });
    } else {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          if (user.is_admin) {
            res.json({ message: 'Admin logged in successfully', flag: 'CTF{Br0k3n_P4ssw0rd_R3s3t}' });
          } else {
            res.json({ message: 'User logged in successfully' });
          }
        } else {
          res.status(401).json({ error: 'Invalid credentials' });
        }
      });
    }
  });
});

app.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(20).toString('hex');
  const resetLink = `http://localhost:${port}/reset-password?email=${email}&token=${token}`;
  
  const mailOptions = {
    from: 'YOUR_GMAIL_ADDRESS',
    to: email,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: ${resetLink}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).json({ error: 'Error sending email' });
    } else {
      res.json({ message: 'Password reset email sent' });
    }
  });
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.post('/reset-password', (req, res) => {
  const { email, token, newPassword } = req.body;
  if (token) {
    bcrypt.hash(newPassword, 10, (err, hash) => {
      db.run("UPDATE users SET password = ? WHERE email = ?", [hash, email], (err) => {
        if (err) {
          res.status(500).json({ error: 'Error resetting password' });
        } else {
          res.json({ message: 'Password reset successfully' });
        }
      });
    });
  } else {
    res.status(400).json({ error: 'Invalid token' });
  }
});

app.listen(port, () => {
  console.log(`CTF challenge running on http://localhost:${port}`);
});