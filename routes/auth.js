const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const { check, validationResult } = require('express-validator');

const connection = require('../config/connection');
const { BCRYPTSALT, SECRET } = require('../config/vars');

router.post(
  '/login', 
  [
    check('username').notEmpty().withMessage('Username is required.'),
    check('password').notEmpty().withMessage('Password is required.'),
  ],
  (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: "Validation errors",
        errors: errors.array()
      });
    }

    let username = req.body.username;
    let password = req.body.password;

    connection.query(
      'SELECT * FROM users WHERE username="' + username + '"',
      (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
          });
        }
        if (result.length > 0) {
          
          if (bcrypt.compareSync(password, result[0].password)) {
            delete result[0].password;
            const user = JSON.parse(JSON.stringify(result[0])); // convert rowdatapacket to object
            const token = jwt.sign(user, SECRET);
            return res.status(200).json({
              success: true,
              message: 'You are logged In',
              data: {
                user,
                token,
              }
            });
          } else {
            return res.status(400).json({
            success: false,
              message: 'Invalid Password',
              errors: [
                {
                  msg: 'The password you provided, is not correct.',
                  param: 'password'
                }
              ] 
            });
          }

        } else {
          return res.status(400).json({
            success: false,
            message: 'Invalid Username',
            errors: [
              {
                msg: 'Username was not found in record.',
                param: 'username'
              }
            ] 
          });
        }
      }
    );

  }
);

router.post(
  '/register', 
  [
    check('name')
      .isLength({ min: 3, max: 15 }).withMessage('Name must between 3 and 15 characters.'),
    check('phone')
      .isLength({ min: 12, max: 12 }).withMessage('Phone Number must be 12 characters long.'),
    check('username')
      .isLength({ min: 5, max: 10 }).withMessage('Username must between 5 and 10 characters.'),
    check('password')
      .isLength({ min: 8, max: 12 }).withMessage('Password must between 8 and 12 characters.'),
    check('passwordConfirmation')
      .custom((value, {req}) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation is incorrect.');
        }
        return true;
      })
  ],
  (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: "Validation errors",
        errors: errors.array()
      });
    }

    let name = req.body.name;
    let phone = req.body.phone;
    let username = req.body.username;
    let password = req.body.password;

    connection.query(
      'INSERT INTO users(name, username, phone, password) VALUES("'+ 
        name +'", "'+ username +'", "'+ phone +'", "' +
        bcrypt.hashSync(password, BCRYPTSALT) +
      '")',
      (err, result) => {
        if (err) {
          if (err.code == 'ER_DUP_ENTRY' || err.errno == 1062) {
            let sqlMessage = err.sqlMessage.split("'");
            return res.status(400).json({
              success: false,
              message: 'Duplicate Entry Error',
              errors: [
                {
                  msg: 'Value ' + sqlMessage[1] + ' already exists.',
                  param: sqlMessage[3]
                }
              ]
            });
          } else {
            return res.status(500).json({
              success: false,
              message: "Internal Server Error"
            });
          }
        }
        return res.status(201).json({
          success: true,
          message: 'Registeration was successful. You may now login.'
        });
      }
    );

  }
);



module.exports = router;