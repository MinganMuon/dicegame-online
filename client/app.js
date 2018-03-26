var socket = io();

$(document).ready(function(){
  var App;
  var ishost = false;
  var theboard;
  var clientusername = "";
  
  updatescore = function(){
    socket.emit('gotscore', theboard.scoreboard());
  }
  
  displayscores = function(thescores){
    var scoretext = "";
    for (i=0; i < thescores.length; i++) {
      if (thescores[i].user === clientusername) {
        scoretext = scoretext + "  " + thescores[i].user + " (you): " + thescores[i].score.toString();
      } else {
        scoretext = scoretext + "  " + thescores[i].user + ": " + thescores[i].score.toString();
      }
    }
    $('#scorearea-div').html(scoretext);
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
  
  switchbtnclick = function() {
    if ($('#btnSwitchScoreDice').html() === "Dice") {
      // switch to dice
      $('.switcharea-div').html($('#dice-template').html());
      $('#btnSwitchScoreDice').html("Scores");
    } else {
      // switch to score
      $('.switcharea-div').html($('#score-template').html());
      $('#btnSwitchScoreDice').html("Dice");
      // this forces the server to re-emit the scores so the score area can be updated
      updatescore();
    }
  }
  
  diceclick = function() {
    var dielist = ["red-dice","yellow-dice","green-dice","blue-dice","white-dice1","white-dice2"];
    for (var i = 0; i < dielist.length; i++) {
        randomnumber = Math.floor(Math.random()*6) + 1;
        $('#'+dielist[i]).html(randomnumber.toString());
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
      window.onresize = App.onresizeHandler;
      App.onresizeHandler();
    },
    
    onresizeHandler: function(){
      if ( $(window).height() >= $(window).width() ) {
        // bad
        $(".bad-orient-div").remove();
        var bscr = $("<div id='bad-orient'>Please rotate your device to landscape mode.</div>").addClass("bad-orient-div");
        $('body').append(bscr);
      } else {
        // good
        $(".bad-orient-div").remove();
      }
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
      clientusername = $('#name-input').val();
      console.log('put request in for makeGame');
    },
    
    onJoinGameClick: function(){
      socket.emit('joinGame', $('#name-input').val(), parseInt($('#gameid-input').val()));
      clientusername = $('#name-input').val();
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