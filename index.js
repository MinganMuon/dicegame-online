var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

var numUsers = 0;
var rooms = []; // roomID, users [{id, name, host?, score}], started?

getnuminroom = function(reqroomID){
  var rid = rooms.findIndex(o => o.roomID === reqroomID);
  return rooms[rid].users.length;
};

sendoutscores = function(theroomID){
  var rid = rooms.findIndex(o => o.roomID === theroomID);
  if (rid !== -1) {
    var thescores = [];
    for (var i=0; i < rooms[rid].users.length; i++) { 
      thescores.push({user: rooms[rid].users[i].name, score: rooms[rid].users[i].score});
    }
    io.to(theroomID).emit('scores', thescores);
  }
}

io.on('connection', function(socket){
  numUsers++;
  console.log(numUsers + " online");
  
  socket.on('gotscore', function(newscore){
    var gameID = parseInt(Object.keys(socket.rooms).filter(item => item != socket.id)[0]);
    var rid = rooms.findIndex(o => o.roomID === gameID);
    if (rid !== -1) {
      if (rooms[rid].started) {
        var uid = rooms[rid].users.findIndex(o => o.id === socket.id);
        if (uid !== -1) {
          // room exists, game started, user exists
          rooms[rid].users[uid].score = newscore;
          sendoutscores(gameID);
        }
      }
    }
  });
  
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
      users: [{id: socket.id, name: givenname, host: true, score: 0}],
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
          host: false,
          score: 0
        });
        socket.join(gameID);
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
    console.log("received request for startGame");
    gameID = parseInt(Object.keys(socket.rooms).filter(item => item != socket.id)[0]);
    rid = rooms.findIndex(o => o.roomID === gameID);
    if (rid !== -1) {
      if (!rooms[rid].started) {
        uid = rooms[rid].users.findIndex(o => o.id === socket.id);
        if (uid !== -1) {
          if (rooms[rid].users[uid].host){
            // room has been created, game has not started, user is in room, user is host
            // now start the game
            rooms[rid].started = true;
            socket.emit('game start successful');
            io.to(gameID).emit('game started');
            io.to(gameID).emit('game-title', 'Room ' + gameID);
            sendoutscores(gameID);
            console.log("game started in room " + gameID.toString());
          }
        }
      }
    }
  });
  
  socket.on('stopGame', function(){
    console.log("received request for stopGame");
    gameID = parseInt(Object.keys(socket.rooms).filter(item => item != socket.id)[0]);
    rid = rooms.findIndex(o => o.roomID === gameID);
    if (rid !== -1) {
      if (rooms[rid].started) {
        uid = rooms[rid].users.findIndex(o => o.id === socket.id);
        if (uid !== -1) {
          if (rooms[rid].users[uid].host){
            // room has been created, game has started, user is in room, user is host
            // now stop the game
            rooms[rid].started = false; // is this line really needed?
            socket.emit('game stop successful');
            io.to(gameID).emit('game stopped');
            for (var i=0; i < rooms[rid].users.length; i++) { // make all clients leave room
              io.sockets.connected[rooms[rid].users[i].id].leave(gameID);
            }
            rooms.splice(rid,1); // remove room
          }
        }
      }
    }
    console.log("game stopped in room " + gameID.toString());
  });
  
  socket.on('disconnect', function(){
    numUsers--;
    console.log(numUsers + " online");
    
    let sid = socket.id;
    for (var i = 0; i < rooms.length; i++) {
      uindex = rooms[i].users.findIndex(item => item.id === sid);
      if (uindex !== -1) {
        // the user was in a room
        uname = rooms[i].users[uindex].name;
        rooms[i].users.splice(uindex,1); // remove user from rooms
        // emit number of users in room to people in room
        io.to(rooms[i].roomID).emit('number in room', rooms[i].users.length, rooms[i].roomID);
        // logging
        console.log(uname + ' left room ' + rooms[i].roomID);
        // TODO: if the host leaves another user should take over the role of host
      }
    }
  });
    
});

http.listen(3000, function(){
  console.log('listening on port 3000');
});
