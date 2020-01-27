const connection = require('./connection');

// Create Database
connection.query(
  'create database if not exists woochat', 
  (error, result, fields) => {
    if (error) throw error;
    console.log(result);
  }
);

// Create Database
connection.query(
  'use woochat', 
  (error, result, fields) => {
    if (error) throw error;
    console.log(result);
  }
);


// Create Users Table
connection.query(
  'create table if not exists users(id INT AUTO_INCREMENT, name VARCHAR(100) NOT NULL, username VARCHAR(100) NOT NULL, phone VARCHAR(15) NOT NULL, password VARCHAR(1000) NOT NULL, UNIQUE(username), UNIQUE(phone), PRIMARY KEY(id))',
  (error, result, fields) => {
      if (error) throw error;
      console.log(result);
  }
);

// Create Contacts Table
connection.query(
  'create table if not exists contacts(id INT AUTO_INCREMENT, user_phone VARCHAR(15), owner_id INT, FOREIGN KEY (user_phone) REFERENCES users(phone), FOREIGN KEY (owner_id) REFERENCES users(id), PRIMARY KEY(id))',
  (error, result, fields) => {
    if (error) throw error;
    console.log(result);
  }
);

// Create Messages Table
connection.query(
  "create table if not exists messages(id INT AUTO_INCREMENT, sender_id INT, receiver_id INT, message VARCHAR(255) NOT NULL, FOREIGN KEY (sender_id) REFERENCES users(id), FOREIGN KEY (receiver_id) REFERENCES users(id), PRIMARY KEY(id))",
  (error, result, fields) => {
    if (error) throw error;
    console.log(result);
  }
);



connection.end();