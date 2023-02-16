const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());


const path = require('path');
const {jwtVerify} = require(path.join(__dirname + '/router/jwt'));

// app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', './views'); 
// app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname + '/public')));

app.get('/', (req, res) => {
  res.render('index.ejs', {})
});

const cookie = require("cookie");
// socket.io
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', (socket) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie);  
  const result=jwtVerify(cookies.cookie);
  const username=result.name;
  socket.on('chat message', (msg, roomID) => {
    socket.join(roomID)
    io.to(roomID).emit('chat message', {username:username, message:msg});

  });
});
// socket.io <END>

// API
const userAPI=require('./router/api/user');
app.use('/api', userAPI);
const roomAPI=require('./router/api/room');
app.use('/api', roomAPI);
const live=require('./router/liveStream');
app.use('/live', live);
const room=require('./router/roomStream');
app.use('/room', room);
// const live=require('./router/api/liveStream');
// app.use('/api', live);

server.listen(3000, () => {
  console.log('listening on *:3000');
});