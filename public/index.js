const socket = io('/');
const peer = new Peer();
let myVideoStream;
let myId;
var videoGrid = document.getElementById('video-grid')
var myvideo = document.createElement('video');

let fullscreenVideo = document.createElement('video');
fullscreenVideo.classList.add('fullscreen-video'); 
document.body.appendChild(fullscreenVideo); 

myvideo.muted = true;
const peerConnections = {}
navigator.mediaDevices.getUserMedia({
  video:true,
  audio:true
}).then((stream)=>{
  myVideoStream = stream;
  addVideo(myvideo , stream);
  peer.on('call' , call=>{
    call.answer(stream);
      const vid = document.createElement('video');
    call.on('stream' , userStream=>{
      addVideo(vid , userStream);
    })
    call.on('error' , (err)=>{
      alert(err)
    })
    call.on("close", () => {
        console.log(vid);
        vid.remove();
    })
    peerConnections[call.peer] = call;
  })
}).catch(err=>{
    alert(err.message)
})
peer.on('open' , (id)=>{
  myId = id;
  socket.emit("newUser" , id , roomID);
})
peer.on('error' , (err)=>{
  alert(err.type);
});
socket.on('userJoined' , id=>{
  console.log("new user joined")
  const call  = peer.call(id , myVideoStream);
  const vid = document.createElement('video');
  call.on('error' , (err)=>{
    alert(err);
  })
  call.on('stream' , userStream=>{
    addVideo(vid , userStream);
  })
  call.on('close' , ()=>{
    vid.remove();
    console.log("user disconect")
  })
  peerConnections[id] = call;
})
socket.on('userDisconnect' , id=>{
  if(peerConnections[id]){
    peerConnections[id].close();
  }
})
function addVideo(video , stream){
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video);
}



const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}


// Add click event to each video element in the video grid
videoGrid.addEventListener('click', (event) => {
  const videoElement = event.target;

  // Check if the clicked element is a video
  if (videoElement.tagName === 'VIDEO') {
    // Toggle fullscreen
    if (!fullscreenVideo.classList.contains('active')) {
      openFullscreen(videoElement);
    } else {
      closeFullscreen();
    }
  }
});

// Function to open the video in fullscreen
function openFullscreen(videoElement) {
  fullscreenVideo.srcObject = videoElement.srcObject; // Set the same video stream
  fullscreenVideo.play();
  fullscreenVideo.classList.add('active'); // Show the video
  videoElement.style.display = 'none'; // Hide the clicked video in the grid

  // Add event listener to the fullscreen video to handle clicks to close fullscreen
  fullscreenVideo.addEventListener('click', closeFullscreen);
}

// Function to close the fullscreen mode
function closeFullscreen() {
  fullscreenVideo.classList.remove('active'); // Hide the fullscreen video
  const visibleVideo = document.querySelector('video');
  if (visibleVideo) {
    visibleVideo.style.display = 'block'; // Make other videos visible again
  }
  fullscreenVideo.pause(); // Pause the fullscreen video
  fullscreenVideo.srcObject = null; // Clear the video stream
  
  // Remove the event listener to prevent multiple listeners
  fullscreenVideo.removeEventListener('click', closeFullscreen);
}
