const express = require('express');
const session = require('express-session'); 
const dotenv = require('dotenv');  
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 4000;
const {v4:uuidv4} = require('uuid');
const {ExpressPeerServer} = require('peer')
const peer = ExpressPeerServer(server , {
  debug:true
});
app.use('/peerjs', peer);
app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); 

// Load environment variables from .env file
dotenv.config();

// Retrieve secret code from environment variables
const SECRET_CODE = process.env.SECRET_CODE;

// Set up express-session middleware
app.use(session({
  secret: 'your-secret-key', // Secret key to sign the session ID cookie
  resave: false,             // Don't save session if unmodified
  saveUninitialized: true,   // Create session if one doesn't exist
  cookie: { secure: false }  // For development; use true with HTTPS
}));


// Route to redirect to the security page
app.get('/', (req, res) => {
  res.render('security'); 
});

// Route to handle form submission and redirect to room if code is correct
app.post('/enter-room', (req, res) => {
  const enteredCode = req.body.secretCode;
  const roomCode = req.body.roomCode;
  
  if (enteredCode === SECRET_CODE && roomCode) {
    req.session.authenticated = true; // Store the session state
    res.redirect(`/${roomCode}`); // Redirect to a new room after the correct code is entered
  } else {
    res.render('security', { message: 'Invalid code! Please try again.' }); 
  }
});

app.get('/:room' , (req,res)=>{
  if (!req.session.authenticated) {
    return res.redirect('/');
  }

  res.render('index' , {RoomId:req.params.room});
});

io.on("connection" , (socket)=>{
  socket.on('newUser' , (id , room)=>{
      socket.join(room);
    socket.to(room).broadcast.emit('userJoined' , id);
    socket.on('disconnect' , ()=>{
        socket.to(room).broadcast.emit('userDisconnect' , id);
    })
  })
})
server.listen(port , ()=>{
  console.log("Server running on port : " + port);
})
