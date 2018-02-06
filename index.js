var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

var numUsers = 0;
var rooms = []; // roomID, users [{id, name, host?}], started?

getnuminroom = function(reqroomID){
  rid = rooms.findIndex(o => o.roomID === reqroomID);
  return rooms[rid].users.length;
};

io.on('connection', function(socket){
  numUsers++;
  console.log(numUsers + " online");
  
  socket.on('makeGame', function(givenname){
    console.log('received request for makeGame');
    // get new room id
    let newroomid = 0;
    while (newroomid === 0) {
      let trial = Math.floor(Math.random() * 100);
      if (rooms.every( function (room) {
        return trial !== room.roomID;
      })) {
        newroomid = trial;
      }
    }
    // make room
    rooms.push({
      roomID: newroomid,
      users: [{id: socket.id, name: givenname, host: true}],
      started: false
    });
    // join room
    socket.join(newroomid.toString());
    // state the make was successful
    socket.emit('make successful', newroomid);
    // emit number of users in the room
    io.to(newroomid.toString()).emit('number in room', getnuminroom(newroomid), newroomid);
    // logging
    console.log(givenname + ' made a new room: ' + newroomid.toString());
  });
  
  socket.on('joinGame', function(givenname, gameID){
    console.log('received request for joinGame');
    rid = rooms.findIndex(o => o.roomID === gameID);
    if (rid !== -1) {
      if (rooms[rid].started) {
        // game already started
        socket.emit('game already started');
      } else {
        // client can join
        // add user into room
        rooms[rid].users.push({
          id: socket.id,
          name: givenname,
          host: false
        });
        let numberinroom = getnuminroom(gameID);
        // emit number of users in room to client who joined
        socket.emit('join successful', gameID, numberinroom);
        // emit number of users in room to people in room
        io.to(gameID).emit('number in room', numberinroom, gameID);
        // logging
        console.log(givenname + ' joined room ' + gameID);
      }
    } else {
      // no game with that game id
      socket.emit('no game with given id');
    }
  });
  
  socket.on('startGame', function(){
    
  });
  
  socket.on('stopGame', function(){
    
  });
  
  // TODO: add something here to remove client from user list on disconnect
  socket.on('disconnect', function(){
    numUsers--;
    console.log(numUsers + " online");
  });
});

http.listen(3000, function(){
  console.log('listening on port 3000');
});