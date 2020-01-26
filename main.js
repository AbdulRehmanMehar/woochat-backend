const express = require('express');
const bodyParser = require("body-parser");

const { PORT } = require('./config/vars');
const authRoutes = require('./routes/auth');
const connection = require('./config/connection');
const protectedRoutes = require('./routes/protected');

connection.query('use woochat'); 

const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/', protectedRoutes);

app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

app.listen(PORT);