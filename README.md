npm init -y
npm install express mysql2 body-parser
node server.js

start mysql and apache on control panel. i didnt start mysql but it worked

CREATE DATABASE lab_auth;

USE lab_auth;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(50)
);

INSERT INTO users (username, password) VALUES
('roopa', '1234'),
('admin', 'admin123');

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description VARCHAR(200)
);

INSERT INTO products (name, description) VALUES
('Laptop', 'HP laptop with SSD'),
('Phone', 'Android smartphone'),
('Headphones', 'Wireless bluetooth headphones');

