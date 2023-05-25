const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const port = process.env.PORT || 4000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  res.render('index', { roomId: req.params.room });
});

io.on('connection', (socket) => {

   socket.on('ping', (data) => {
        console.log('ping', data);
   });
  // ping every 15 seconds
//   setInterval(() => {
//     socket.emit('ping', { data: 'ping' });
//   }, 15000);
//   socket.on('pong', (data) => {
//     console.log('pong', data);
//   });

  // socket join room
  socket.on('join-room', (roomId,userId) => {
    socket.join(roomId);
    io.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      io.to(roomId).emit('user-disconnected');
      console.log('user disconnected');
    });

  });  

});  

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});