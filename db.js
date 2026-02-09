const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Mysqlroopa123!",   // put your MySQL password if you have one
    database: "lab_auth"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed");
    } else {
        console.log("Database connected");
    }
});

module.exports = db;
