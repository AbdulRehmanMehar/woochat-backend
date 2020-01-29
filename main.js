const cors = require('cors');
const http = require('http');
const express = require('express');
const socket = require('socket.io');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const connection = require('./config/connection');
const { PORT, SECRET } = require('./config/vars');
const protectedRoutes = require('./routes/protected');

connection.query('use woochat'); 

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);

app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});


server.listen(PORT);

// Socket.io 

let onlineUsers = [];
let pendingMessages = [];

io.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    const token = socket.handshake.query.token;
    jwt.verify(token, SECRET, (error, payload) => {
      if (error) return next(new Error("Socket.io Authentication Error Occured."));
      socket.request.user = payload;
    });
    next();
  } else {
      return next(new Error("Socket.io Authentication Error Occured."));
  }
});

io.on('connection', (socket) => {

  let user = {
    socket: socket.id,
    user: socket.request.user
  };

  if (!onlineUsers.includes(user)) onlineUsers.push(user);


  // Lets Send Pending Messages

  pendingMessages.forEach((message, idx) => {
    let reciever = onlineUsers.filter(u => u.user._id == message.reciever)[0];
    if (reciever) {
      io.to(reciever.socket).emit(message);
      pendingMessages.splice(idx, 1);
    }
  });


  socket.on('conversation', (data) => {
    if (data.reciever) {
      connection.query(
        'SELECT * FROM messages WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)',
        [
          socket.request.user.id,
          data.reciever,
          data.reciever,
          socket.request.user.id,
        ],
        (err, results) => {
          if (err) {
            socket.emit('notification', {
              success: false,
              message: 'Internal Server Error'
            });
          } else {
            socket.emit('conversation', {
              success: true,
              message: 'Got Results',
              data: {
                conversation: results
              }
            });
          }
        }
      )
    } else {
      socket.emit('notification', {
        success: false,
        message: 'Invalid Arguments'
      });
    }
  });

  socket.on('message', (data) => {
    if (data.message && data.reciever && socket.request.user.id != data.reciever) {
      let reciever = onlineUsers.filter(
        u => u.user.id == data.reciever
      )[0];

      connection.query(
        'INSERT INTO messages(sender_id, receiver_id, message) VALUES (?, ?, ?)',
        [
          socket.request.user.id,
          data.reciever,
          data.message
        ],
        (err, res) => {
          if (err) {
            socket.emit('notification', {
              success: false,
              message: 'Internal Server Error'
            });
          } else {
            const message = {
              sender_id: socket.request.user.id,
              receiver_id: data.reciever,
              message: data.message
            };

            if (reciever) {
              io.to(reciever.socket).emit('message', message);
            } else {
              pendingMessages.push(message);
            }

          }

        }
      )
    } else {
      socket.emit('notification', {
        success: false,
        message: 'Invalid Arguments'
      });
    }
  });

  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter(
      o => o.socket !== socket.id
    );
  });

});
