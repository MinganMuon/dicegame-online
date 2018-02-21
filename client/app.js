var socket = io();

$(document).ready(function(){
  var App;
  var ishost = false;
  var theboard;
  
  updatescore = function(){
    // $('#scorearea-div').html('You: ' + theboard.scoreboard().toString());
    socket.emit('gotscore', theboard.scoreboard());
  }
  
  displayscores = function(thescores){
    var scoretext = "";
    var userstext = "";
    for (i=0; i < thescores.length; i++) {
      scoretext = scoretext + " " + thescores[i].user + ": " + thescores[i].score.toString();
      if (i === thescores.length - 1) {
        // if this is the last one in the list
        if (i === 0) {
          // if this is the only one
          userstext = userstext +" " + thescores[i].user;
        } else {
          userstext = userstext + " and " + thescores[i].user;
        }
      } else {
        if (i === thescores.length - 2 && thescores.length === 2) {
          // if the second to last one in the list and there's only two
          userstext = userstext + " " + thescores[i].user;
        } else {
          userstext = userstext + " " + thescores[i].user + ","; 
        }
      }
    }
    $('#scorearea-div').html(scoretext);
    $('#users-in-room').html(userstext);
  }
  
  numtocolor = function(num){
    switch (num) {
      case 0: 
        return "red";
      case 1:
        return "yellow";
      case 2:
        return "green";
      case 3:
        return "blue";
    }
  }
  
  tileclick = function(){
    var row = parseInt($(this).attr('data-row'));
    var num = parseInt($(this).attr('data-number'));
    if (num === 13) {
      // lock tile
      if (theboard.rows[row].rowlocked === true) {
          theboard.rows[row].rowlocked = false;
          $(this).removeClass('cross');
      } else { 
          if (theboard.rows[row].rowlined === true) {
              theboard.rows[row].rowlined = false;
              $('#' + numtocolor(row) + '-div').removeClass('linerow');
          } else {
              theboard.rows[row].rowlocked = true;
              theboard.rows[row].rowlined = true;
              $(this).addClass('cross');
              $('#' + numtocolor(row) + '-div').addClass('linerow');
          }
      }
    } else {
      if (theboard.rows[row].nums[num] === true) {
        theboard.rows[row].nums[num] = false;
        $(this).removeClass('cross');
      } else {
        theboard.rows[row].nums[num] = true;
        $(this).addClass('cross');
      }
    }
    updatescore();
  }
  
  pboxclick = function(){
      var psofar = theboard.penalties;
      var num = parseInt($(this).attr('data-number')) + 1; // because num = 0 means the first pbox
      if (num == psofar + 1) {
          // check it!
          $(this).addClass('cross');
          theboard.penalties = theboard.penalties + 1;
      } else if (num == psofar) {
          // uncheck it!
          $(this).removeClass('cross');
          theboard.penalties = theboard.penalties - 1;
      }
      updatescore();
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
    $('#btnStartGame').css("visibility", "visible");
  });
  
  socket.on('join successful', function(roomno,numroom) {
    ishost = false;
    $('#gameArea').html($('#wait-screen-template').html());
    // just in case the first numroom update is received too fast
    $('span#numberofplayers').text(numroom.toString());
    $('span#roomno-wait').text(roomno.toString());
    // disable start game button
    $('#btnStartGame').disabled = true;
    $('#btnStartGame').css("visibility", "hidden");
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
    theboard = new board();
    $('#gameArea').append(genboardareahtml(tileclick, pboxclick));
    if (ishost) {
      $('#btnStopGame').disabled = false;
      $('#btnStopGame').css("visibility", "visible");
    } else {
      $('#btnStopGame').disabled = true;
      $('#btnStopGame').css("visibility", "hidden");
    }
  });
  
  socket.on('game stopped', function() {
    console.log("game stopped");
    App.showintroscreen();
  });
  
  socket.on('game-title', function(title) {
    $('span#game-title').text(title);
  });
  
  socket.on('scores', function(thescores) {
    displayscores(thescores);
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