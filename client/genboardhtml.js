// genboardhtml.js

// number: int from 2 to 13 - if 13, tile is the lock tile
function gentilehtml(color, number, clickhandler, row) {
  var bt = $("<div></div>");
  bt.addClass("tile-div");
  bt.addClass("unselectable");
  bt.attr("data-color", color);
  if (number === 13) {
    bt.html("+");
  } else {
    bt.text(number.toString());
  }
  bt.attr("data-number", number);
  bt.attr("data-row", row);
  bt.on('click', clickhandler);
  return bt;
}

function genboardhtml(clickhandler) {
  var bh = $("<div id='board-div'></div>").addClass("board-div");
  
  var br = $("<div id='red-div'></div>").addClass("row-div");
  for (i = 2; i < 14; i++){
    br.append(gentilehtml("red",i,clickhandler, 0));
  }
  bh.append(br);
  
  var by = $("<div id='yellow-div'></div>").addClass("row-div");
  for (i = 2; i < 14; i++){
    by.append(gentilehtml("yellow",i,clickhandler, 1));
  }
  bh.append(by);
  
  var bg = $("<div id='green-div'></div>").addClass("row-div");
  for (i = 12; i > 1; i--){
    bg.append(gentilehtml("green",i,clickhandler, 2));
  }
  bg.append(gentilehtml("green",13,clickhandler, 2));
  bh.append(bg);
  
  var bb = $("<div id='blue-div'></div>").addClass("row-div");
  for (i = 12; i > 1; i--){
    bb.append(gentilehtml("blue",i,clickhandler, 3));
  }
  bb.append(gentilehtml("blue",13,clickhandler, 3));
  bh.append(bb);
  
  return bh;
}

function genpboxshtml(clickhandler) {
    var pbh = $("<div id='pboxs-div'></div>").addClass("pboxs-div");
    for (i = 0; i < 4; i++){
      var bt = $("<div></div>");
      bt.addClass("pbox-div");
      bt.addClass("unselectable");
      bt.attr("data-number", i);
      bt.on('click', clickhandler);
      pbh.append(bt);
    }
    return pbh;
}

function genboardareahtml(tileclickhandler, pboxclickhandler, switchclickhandler){
      var bah = $("<div id='boardarea-div'></div>").addClass("boardarea-div");
      // board
      bah.append(genboardhtml(tileclickhandler));
      // area under board
      var bla = $("<div id='boardlowerarea-div'></div>").addClass("boardlowerarea-div");
      bla.append(genpboxshtml(pboxclickhandler));
      bla.append($("<div class='switchbutton-div'><button class='switchbutton unselectable' id='btnSwitchScoreDice' onclick='switchbtnclick()'>Dice</button></div>"));
      var bsa = $("<div id='switcharea-div'></div>").addClass("switcharea-div");
      //var bscr = $("<div id='scorearea-div'></div>").addClass("scorearea-div");
      //bscr.html("");
      //bscr.addClass("unselectable");
      //bsa.append(bscr);
      bsa.html($('#score-template').html());
      bla.append(bsa);
      bla.append($("<div class='stopbutton-div'><button class='stopbutton unselectable' id='btnStopGame'>Stop the<br/>game</button></div>"));
      bah.append(bla);
      return bah;
}





