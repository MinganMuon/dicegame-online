var socket = io();

$(document).ready(function(){
  var App;
  var ishost = false;
  var theboard;
  
  tileclick = function(){
    row = parseInt($(this).attr('data-row'));
    num = parseInt($(this).attr('data-number'));
    if (num === 13) {
      // lock tile
    } else {
      if (theboard.rows[row].nums[num] === true) {
        theboard.rows[row].nums[num] = false;
        // check tile...
      } else {
        theboard.rows[row].nums[num] = true;
        // uncheck tile...
      }
    }
  }
  
  socket.on('number in room', function(numroom, roomno) {
    $('span#numberofplayers').text(numroom.toString());
    $('span#roomno-wait').text(roomno.toString());
  });
  
  socket.on('make successful', function(roomno) {
    ishost = true;
    $('#gameArea').html($('#wait-screen-template').html());
    // just in case the first numroom update is received too fast
    $('span#numberofplayers').text('1');
    $('span#roomno-wait').text(roomno.toString());
    // enable start game button
    $('#btnStartGame').disabled = false;
  });
  
  socket.on('join successful', function(roomno,numroom) {
    ishost = false;
    $('#gameArea').html($('#wait-screen-template').html());
    // just in case the first numroom update is received too fast
    $('span#numberofplayers').text(numroom.toString());
    $('span#roomno-wait').text(roomno.toString());
    // disable start game button
    $('#btnStartGame').disabled = true;
  });
  
  socket.on('game start successful', function() {
    console.log("game start successful");
  });
  
  socket.on('game stop successful', function() {
    console.log("game stop successful");
  });
  
  socket.on('game started', function() {
    console.log("game started");
    $('#gameArea').html($('#start-screen-template').html());
    if (ishost) {
      $('#btnStopGame').disabled = false;
    } else {
      $('#btnStopGame').disabled = true;
    }
    theboard = new board();
    $('#gameArea').append(genboardhtml(tileclick));
  });
  
  socket.on('game stopped', function() {
    console.log("game stopped");
    App.showintroscreen();
  });
  
  socket.on('game-title', function(title) {
    $('span#game-title').text(title);
  });
  
  App = {
    init: function(){
      App.bindbuttons();
      App.showintroscreen();
    },
    
    bindbuttons: function(){
      $(document).on('click', '#btnIntroMakeGame', App.onIntroMakeGameClick);
      $(document).on('click', '#btnIntroJoinGame', App.onIntroJoinGameClick);
      $(document).on('click', '#btnMakeGame', App.onMakeGameClick);
      $(document).on('click', '#btnJoinGame', App.onJoinGameClick);
      $(document).on('click', '#btnStartGame', App.onStartGameClick);
      $(document).on('click', '#btnStopGame', App.onStopGameClick);
    },
    
    onIntroMakeGameClick: function(){
      App.showmakegamescreen();
    },
    
    onIntroJoinGameClick: function(){
      App.showjoingamescreen();
    },
    
    showintroscreen: function(){
      $('#gameArea').html($('#intro-screen-template').html());
      console.log("showed intro screen");
    },
    
    showmakegamescreen: function(){
      $('#gameArea').html($('#make-game-template').html());
      console.log("showed make game screen");
    },
    
    showjoingamescreen: function(){
      $('#gameArea').html($('#join-game-template').html());
      console.log("showed join game screen");
    },
    
    onMakeGameClick: function(){
      socket.emit('makeGame', $('#name-input').val());
      console.log('put request in for makeGame');
    },
    
    onJoinGameClick: function(){
      socket.emit('joinGame', $('#name-input').val(), parseInt($('#gameid-input').val()));
      console.log('put request in for joinGame');
    },
    
    onStartGameClick: function(){
      socket.emit('startGame');
      console.log('put request in for startGame');
    },
    
    onStopGameClick: function(){
      socket.emit('stopGame');
      console.log('put request in for stopGame');
    },
  };
  
  App.init();
});