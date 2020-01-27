const bcrypt = require('bcryptjs');
const { BCRYPTSALT } = require('./vars');
const connection = require('./connection');

connection.query('use woochat');

connection.query(
  'INSERT INTO users(name, username, phone, password) VALUES("Abdul Rehman", "mehar6925", "123456789012", "' +
    bcrypt.hashSync("abcd1234", BCRYPTSALT) +
    '")',
  (err, result, fields) => {
    if (err) throw err;
    console.log(result);
  }
);

connection.end();