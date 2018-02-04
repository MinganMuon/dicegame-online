var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/client'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

var numUsers = 0;

io.on('connection', function(socket){
  numUsers++;
  console.log(numUsers + " online");
  socket.on('disconnect', function(){
    numUsers--;
    console.log(numUsers + " online");
  });
});

http.listen(3000, function(){
  console.log('listening on port 3000');
});