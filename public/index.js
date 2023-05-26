const socket = io('/'); // Establish a socket connection to the server

const peer = new Peer(); // Create a new Peer instance

let myVideoStream; // Variable to store the user's video stream
let myId; // Variable to store the user's ID

var videoGrid = document.getElementById('video-grid'); // Get the video grid element
var myvideo = document.createElement('video'); // Create a video element for the user's video
myvideo.muted = true; // Mute the user's own video

const peerConnections = {}; // Object to store the peer connections

// Request user's media (video and audio) stream
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then((stream) => {
  myVideoStream = stream; // Store the user's media stream
  addVideo(myvideo, stream); // Add user's video to the video grid

  peer.on('call', (call) => {
    call.answer(stream); // Answer incoming call with the user's stream

    const vid = document.createElement('video'); // Create a video element for the remote user
    call.on('stream', (userStream) => {
      addVideo(vid, userStream); // Add remote user's video to the video grid
    });

    call.on('error', (err) => {
      alert(err); // Display error if call encounters an error
    });

    call.on("close", () => {
      console.log(vid);
      vid.remove(); // Remove the video element when call is closed
    });

    peerConnections[call.peer] = call; // Store the call object in the peer connections object
  });
}).catch((err) => {
  alert(err.message); // Display error if accessing media devices fails
});

peer.on('open', (id) => {
  myId = id; // Store the user's peer ID
  socket.emit("newUser", id, roomID); // Notify the server that a new user has joined with their ID and room ID
});

peer.on('error', (err) => {
  alert(err.type); // Display error if there is a Peer error
});

socket.on('userJoined', (id) => {
  console.log("new user joined");
  const call = peer.call(id, myVideoStream); // Initiate a call to the newly joined user

  const vid = document.createElement('video'); // Create a video element for the remote user
  call.on('error', (err) => {
    alert(err); // Display error if call encounters an error
  });

  call.on('stream', (userStream) => {
    addVideo(vid, userStream); // Add remote user's video to the video grid
  });

  call.on('close', () => {
    vid.remove(); // Remove the video element when call is closed
    console.log("user disconnected");
  });

  peerConnections[id] = call; // Store the call object in the peer connections object
});

socket.on('userDisconnect', (id) => {
  if (peerConnections[id]) {
    peerConnections[id].close(); // Close the peer connection when a user disconnects
  }
});

// Function to add video to the video grid
function addVideo(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video); // Add the video element to the video grid
}

// Extra functionality for mute/unmute and play/stop video buttons

// Function to mute/unmute the user's audio
const muteUnmute = ()
