const router = require('express').Router();
const { check, validationResult } = require('express-validator');

const connection = require('../config/connection');
const { checkToken } = require('../middlewares/jwt');

router.use(checkToken);

router.get('/contacts', (req, res) => {
  connection.query(
    'SELECT users.id, users.name, users.username, users.phone FROM contacts INNER JOIN users ON contacts.user_phone=users.phone WHERE contacts.owner_id="'+ req.user.id +'"',
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Internal Server Error'
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Contact List',
        data: {
          contacts: result
        }
      });
    }
  );
});

router.post(
  '/contact',
  [
    check('phone')
      .trim()
      .escape()
      .isLength({ min: 12, max: 12 }).withMessage('Length of Phone Number must be 12.')
      .custom((value, { req }) => {
        if (value == req.user.phone) {
          throw new Error('You cannot add yourself in contacts.');
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

    let contact = req.body.phone;

    connection.query(
      'INSERT INTO contacts(user_phone, owner_id) VALUES( "' + contact + '", "' + req.user.id +'")',
      (err, result) => {
        if (err) {
          if (err.code == 'ER_NO_REFERENCED_ROW_2' || err.errno == 1452) {
            return res.status(400).json({
              success: false,
              message: 'Invalid Phone Number',
              errors: [
                {
                  msg: 'There is no user with provided phone number.',
                  param: 'phone'
                }
              ]
            });
          } else {
            return res.status(500).json({
              success: false,
              message: 'Internal Server Error'
            });
          }
        }

        connection.query(
          'SELECT users.id, users.name, users.username, users.phone FROM contacts INNER JOIN users ON contacts.user_phone=users.phone WHERE contacts.id="' +
            result.insertId +
            '"',
            (error, response) => {
              if (error) {
                return res.status(500).json({
                  success: false,
                  message: 'Internal Server Error'
                });
              }
              const user = JSON.parse(JSON.stringify(response[0]));
              return res.status(201).json({
                success: true,
                message: 'Contact Added',
                data: {
                  user: user
                }
              });
            }
        );

        

      }
    );
  }
);

module.exports = router;