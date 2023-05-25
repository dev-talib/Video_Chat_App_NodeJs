const socket = io();
const videoGrid = document.getElementById('video-grid');
let myVideoStream = null;

socket.on('connect', function() {
    socket.emit('ping', { data: 'ping' });
});

// var peer = new Peer(undefined, {
//     path: '/peerjs',
//     host: '/',
//     port: '4000'
// });
var peer = new Peer();

// Create and append local video element
const myVideo = document.createElement('video');
myVideo.muted = true;
myVideo.autoplay = true;
myVideo.className = 'local-video';

navigator.mediaDevices.getUserMedia({ audio: true, video: true })
.then(function(stream) {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    socket.emit('join-room', ROOM_ID, peer.id);
})
.catch(function(error) {
    // Handle error
    console.error('Error accessing media devices:', error);
});

peer.on('open', (id) => {
    console.log("peer open", id);
    socket.emit('join-room', ROOM_ID, id);
});


const connectToNewUser = (userId, stream) => {
    console.log("connectToNewUser", userId);
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
        console.log("call on stream", userVideoStream);
        addVideoStream(video, userVideoStream);
    });
};

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
};