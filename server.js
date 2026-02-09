const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Login API
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const sql = "SELECT * FROM users WHERE username=? AND password=?";
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            res.send("Error");
        } else if (result.length > 0) {
            res.send("Login Successful");
        } else {
            res.send("Invalid Credentials");
        }
    });
});

// Keyword-based search using LIKE
app.post("/search", (req, res) => {
    const keyword = req.body.keyword;

    const sql = "SELECT * FROM products WHERE name LIKE ?";
    db.query(sql, [`%${keyword}%`], (err, result) => {
        if (err) {
            res.send("Error");
        } else {
            res.send(result);
        }
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
