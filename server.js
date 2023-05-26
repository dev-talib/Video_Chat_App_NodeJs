const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 4000;
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peer = ExpressPeerServer(server, {
  debug: true
});
app.use('/peerjs', peer);
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Redirect to a unique room when the root URL is accessed
app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

// Render the index.ejs file and pass the RoomId parameter
app.get('/:room', (req, res) => {
  res.render('index', { RoomId: req.params.room });
});

// Handle socket.io connections
io.on("connection", (socket) => {
  // When a new user joins a room
  socket.on('newUser', (id, room) => {
    socket.join(room);
    // Notify other users in the room that a new user has joined
    socket.to(room).broadcast.emit('userJoined', id);
    
    // Handle disconnection of a user
    socket.on('disconnect', () => {
      // Notify other users in the room that a user has disconnected
      socket.to(room).broadcast.emit('userDisconnect', id);
    });
  });
});

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log("Server running on port: " + port);
});
