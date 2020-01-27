const bcrypt = require('bcryptjs');
const { BCRYPTSALT } = require('./vars');
const connection = require('./connection');

connection.query('use woochat');

// connection.query(
//   'SELECT users.id, users.name, users.username, users.phone FROM contacts INNER JOIN users ON contacts.user_phone=users.phone WHERE contacts.owner_id="1"',
//   (err, result, fields) => {
//     if (err) throw err;
//     // console.log("Results: ");
//     // delete result[0].password;
//     console.log(result);

//     // console.log( result[0].username );
//   }
// );

connection.query(
  'INSERT INTO contacts(user_phone, owner_id) VALUES( "13456744289012", "1")',
  (err, result, fields) => {
    if (err) {
      console.log({...err});
      console.log(
        err.sqlMessage.split("'")
      );
      
      // console.log(typeof err);
      
      
    }
    console.log(result);
  }
);


connection.end();